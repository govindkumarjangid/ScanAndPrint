import crypto from 'crypto'
import Razorpay from 'razorpay'
import { nanoid } from 'nanoid'
import { shopRepository } from '../repositories/shop.repository.js'
import { hashPassword, comparePassword } from '../utils/password.util.js'
import { generateToken } from '../utils/jwt.util.js'
import { generateShopCode, generateSecretApiKey } from '../utils/shopCode.util.js'
import { envConfig } from '../configs/env.config.js'
import { setShopSession, getShopSession, deleteShopSession } from '../configs/redis.config.js'
import Admin from '../models/Admin.model.js'
import AdminSettings from '../models/AdminSettings.model.js'
import SubscriptionPayment from '../models/SubscriptionPayment.model.js'
import { memoryCache } from '../utils/cache.util.js'

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days matching refresh token expiry

export const authService = {


  async registerInit(data) {
    const {
      password,
      shopName,
      email,
      mobile,
      fullName,
      shopAddress,
      planType = 'MONTHLY_299',
      ...rest
    } = data

    const cleanEmail = email.trim().toLowerCase()
    const cleanMobile = String(mobile).trim()

    // Check if email/mobile already exists
    const existing = await shopRepository.findByPhoneOrEmail(cleanEmail, cleanMobile, { lean: true })

    if (existing) {
      // If the existing account is pending payment, we can let them complete payment
      if (existing.subscriptionStatus === 'PENDING_PAYMENT' && !existing.isSubscriptionActive) {
        return this.createRenewalOrder(existing._id, planType)
      }
      throw new Error('A shop account with this email or mobile number already exists')
    }

    const passwordHash = await hashPassword(password)
    const shopCode = generateShopCode(shopName)
    const secretApiKey = generateSecretApiKey()

    // 2. Fetch active platform pricing & settings
    let settings = await AdminSettings.findOne().lean()
    if (!settings) {
      const created = await AdminSettings.create({})
      settings = created.toObject ? created.toObject() : created
    }
    const monthlyPrice = Number(settings?.monthlyPrice) || 299
    const yearlyPrice = Number(settings?.yearlyPrice) || 799
    const demoDurationHours = Number(settings?.demoDurationHours) > 0 ? Number(settings.demoDurationHours) : 2

    // 3. Handle Free Trial (Demo) Immediate Activation
    if (planType === 'FREE_TRIAL') {
      if (settings && settings.demoMode === false) {
        throw new Error('Free demo registration is currently disabled by Administrator')
      }
      const demoExpiresAt = new Date(Date.now() + demoDurationHours * 60 * 60 * 1000)
      const newShop = await shopRepository.create({
        ...rest,
        shopName,
        ownerName: fullName,
        address: shopAddress,
        email: cleanEmail,
        phone: cleanMobile,
        passwordHash,
        shopCode,
        secretApiKey,
        planType: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
        isSubscriptionActive: true,
        isDemoAccount: true,
        demoExpiresAt,
        subscriptionExpiresAt: demoExpiresAt,
      })

      const tokens = await this._generateAuthTokens(newShop)
      return {
        isFreeTrial: true,
        tokens,
      }
    }

    // Determine Paid Plan Amount (Monthly ₹299 vs Yearly ₹799)
    const isYearly = planType === 'YEARLY_799'
    const planAmount = isYearly ? yearlyPrice : monthlyPrice

    // Create Shop in PENDING_PAYMENT state
    const newShop = await shopRepository.create({
      ...rest,
      shopName,
      ownerName: fullName,
      address: shopAddress,
      email: cleanEmail,
      phone: cleanMobile,
      passwordHash,
      shopCode,
      secretApiKey,
      planType,
      subscriptionStatus: 'PENDING_PAYMENT',
      isSubscriptionActive: false,
    })

    // Create Razorpay Subscription Order
    if (!envConfig.razorpayKeyId || !envConfig.razorpayKeySecret) {
      throw new Error('Razorpay Gateway credentials are not configured on server')
    }

    const razorpay = new Razorpay({
      key_id: envConfig.razorpayKeyId,
      key_secret: envConfig.razorpayKeySecret,
    })

    const orderOptions = {
      amount: Math.round(planAmount * 100), // in paise
      currency: 'INR',
      receipt: `sub_${newShop.shopCode}_${Date.now().toString().slice(-4)}`,
      notes: {
        shopId: String(newShop._id),
        shopCode: newShop.shopCode,
        planType,
        email: cleanEmail,
        mobile: cleanMobile,
      },
    }

    const razorpayOrder = await razorpay.orders.create(orderOptions)

    // Save pending payment record in DB
    await SubscriptionPayment.create({
      shopId: newShop._id,
      shopCode: newShop.shopCode,
      planType,
      amount: planAmount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: 'CREATED',
      rawDetails: razorpayOrder,
    })

    // Save lastOrderId on shop
    await shopRepository.updateById(newShop._id, { lastOrderId: razorpayOrder.id })

    return {
      isFreeTrial: false,
      shopId: newShop._id,
      shopCode: newShop.shopCode,
      shopName: newShop.shopName,
      ownerName: newShop.ownerName,
      email: newShop.email,
      phone: newShop.phone,
      planType,
      amount: planAmount,
      amountPaise: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
      keyId: envConfig.razorpayKeyId,
    }
  },

  // Verify Razorpay payment signature and activate shop dashboard access
  async verifySubscriptionPayment({
    shopId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
  }) {
    if (!shopId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing Razorpay verification parameters')
    }

    const shop = await shopRepository.findById(shopId)
    if (!shop) throw new Error('Shop account not found')

    // Cryptographic HMAC-SHA256 Signature Verification
    const hmacBody = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', envConfig.razorpayKeySecret)
      .update(hmacBody)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Mark transaction as failed
      await SubscriptionPayment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'FAILED', razorpayPaymentId: razorpay_payment_id }
      )
      throw new Error('Cryptographic signature verification failed. Payment is invalid.')
    }

    // Determine target plan and expiration date
    const finalPlanType = planType === 'YEARLY_799' ? 'YEARLY_799' : 'MONTHLY_299'
    let subscriptionExpiresAt = null

    if (finalPlanType === 'MONTHLY_299') {
      // If existing active subscription has days left, extend from current expiry, else from now
      const baseDate =
        shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt) > new Date()
          ? new Date(shop.subscriptionExpiresAt)
          : new Date()
      subscriptionExpiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
    } else if (finalPlanType === 'YEARLY_799') {
      const baseDate =
        shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt) > new Date()
          ? new Date(shop.subscriptionExpiresAt)
          : new Date()
      subscriptionExpiresAt = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000) // +365 days (1 Year)
    }

    // Activate Shop in database
    const updatedShop = await shopRepository.updateById(shopId, {
      subscriptionStatus: 'ACTIVE',
      isSubscriptionActive: true,
      planType: finalPlanType,
      subscriptionExpiresAt,
      lastPaymentId: razorpay_payment_id,
      lastOrderId: razorpay_order_id,
      isDemoAccount: false,
    })

    // Update SubscriptionPayment log to SUCCESS
    await SubscriptionPayment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        activatedFrom: new Date(),
        activatedUntil: subscriptionExpiresAt,
      },
      { upsert: true, returnDocument: 'after' }
    )

    // Issue standard JWT session tokens with single active session
    return await this._generateAuthTokens(updatedShop)
  },

  // Create Razorpay Order for Renewal or Plan Upgrade (Existing Shops)
  async createRenewalOrder(shopId, planType = 'MONTHLY_299') {
    const shop = await shopRepository.findById(shopId)
    if (!shop) throw new Error('Shop not found')

    const settings = await AdminSettings.findOne().lean()
    const monthlyPrice = settings?.monthlyPrice || 299
    const yearlyPrice = settings?.yearlyPrice || 799
    const planAmount = planType === 'YEARLY_799' ? yearlyPrice : monthlyPrice

    if (!envConfig.razorpayKeyId || !envConfig.razorpayKeySecret) {
      throw new Error('Razorpay Gateway credentials are not configured on server')
    }

    const razorpay = new Razorpay({
      key_id: envConfig.razorpayKeyId,
      key_secret: envConfig.razorpayKeySecret,
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(planAmount * 100),
      currency: 'INR',
      receipt: `renew_${shop.shopCode}_${Date.now().toString().slice(-4)}`,
      notes: {
        shopId: String(shop._id),
        shopCode: shop.shopCode,
        planType,
        action: 'RENEWAL',
      },
    })

    await SubscriptionPayment.create({
      shopId: shop._id,
      shopCode: shop.shopCode,
      planType,
      amount: planAmount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: 'CREATED',
      rawDetails: razorpayOrder,
    })

    await shopRepository.updateById(shop._id, { lastOrderId: razorpayOrder.id })

    return {
      isFreeTrial: false,
      shopId: shop._id,
      shopCode: shop.shopCode,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      email: shop.email,
      phone: shop.phone,
      planType,
      amount: planAmount,
      amountPaise: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
      keyId: envConfig.razorpayKeyId,
    }
  },

  // Register a new shop account (Direct fallback)
  async register(data) {
    return this.registerInit(data)
  },

  // Login a shop account and generate auth tokens (Supports Email OR Mobile Number)
  async login({ email, password }) {
    const cleanIdentifier = String(email || '').trim().toLowerCase()
    let shop = await shopRepository.findByEmail(cleanIdentifier, { includePassword: true })
    if (!shop) {
      shop = await shopRepository.findByPhoneOrEmail(cleanIdentifier, cleanIdentifier, { includePassword: true })
    }
    if (!shop) throw new Error('Invalid email, mobile number, or password credentials')

    const isPasswordValid = await comparePassword(password, shop.passwordHash)
    if (!isPasswordValid) throw new Error('Invalid email, mobile number, or password credentials')

    // Block Suspended Shops from logging in
    if (shop.isSuspended) {
      throw new Error('This shop account has been suspended by Administrator. Please contact support.')
    }

    // Synchronize demo / subscription expiration status on login
    const now = new Date()
    if (shop.isDemoAccount && shop.demoExpiresAt) {
      if (now > new Date(shop.demoExpiresAt)) {
        shop.subscriptionStatus = 'EXPIRED'
        shop.isSubscriptionActive = false
        await shop.save()
      } else {
        shop.subscriptionStatus = 'ACTIVE'
        shop.isSubscriptionActive = true
        await shop.save()
      }
    }

    // Single-active-session: generate new sessionId for this login
    const sessionId = nanoid()
    return await this._generateAuthTokens(shop, sessionId)
  },

  // Admin login for superadmin access
  async adminLogin({ email, password }) {
    if (email !== 'scanqrandprint@gmail.com')
      throw new Error('Invalid admin email');

    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = new Admin({ email, password: 'adminofscanandprint@2026' });
      await admin.save();
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      throw new Error('Invalid admin credentials');

    const payload = { adminId: admin._id, role: 'superadmin' };
    const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '2h');

    return { accessToken, admin: { email: admin.email, role: 'superadmin' } };
  },

  // Generate auth tokens for a shop with embedded sessionId
  async _generateAuthTokens(shop, sessionId = null) {
    const currentSessionId = sessionId || nanoid()

    // Store active sessionId in Redis + memory (7 days TTL) - kicks out any previous session
    await setShopSession(shop._id, currentSessionId, SESSION_TTL_SECONDS)

    const payload = {
      shopId: shop._id,
      shopCode: shop.shopCode,
      email: shop.email,
      sessionId: currentSessionId,
    }

    const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '15m')
    const refreshToken = generateToken(payload, '7d')

    const shopResponse = shop.toObject ? shop.toObject() : { ...shop }
    delete shopResponse.passwordHash
    // Never expose hashed razorpay secret to frontend
    if (shopResponse.paymentSettings) {
      delete shopResponse.paymentSettings.razorpayKeySecret
    }

    return { accessToken, refreshToken, shop: shopResponse }
  },

  // Refresh access token while validating against the active Redis session
  async refreshToken(token) {
    if (!token) {
      const err = new Error('Refresh token is required')
      err.statusCode = 401
      throw err
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch (jwtErr) {
      const err = new Error('Invalid or expired refresh token')
      err.statusCode = 401
      throw err
    }

    if (!decoded || !decoded.shopId) {
      const err = new Error('Invalid token payload')
      err.statusCode = 401
      throw err
    }

    // Fetch active session for this shop (with 0ms memory fallback)
    const activeSessionId = await getShopSession(decoded.shopId)

    // Verify request is from current active session (single active session check)
    if (!decoded.sessionId || decoded.sessionId !== activeSessionId) {
      const err = new Error('Your session has expired or you have logged in from another device.')
      err.code = 'SESSION_INVALIDATED'
      err.statusCode = 401
      throw err
    }

    const shop = await shopRepository.findById(decoded.shopId)
    if (!shop) {
      const err = new Error('Shop account not found')
      err.statusCode = 401
      throw err
    }
    if (shop.isSuspended) {
      const err = new Error('Account suspended by Administrator')
      err.statusCode = 403
      throw err
    }

    // Preserve the verified active sessionId in the new access token
    const payload = {
      shopId: shop._id,
      shopCode: shop.shopCode,
      email: shop.email,
      sessionId: decoded.sessionId,
    }

    const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '15m')
    return { accessToken }
  },

  // Invalidate active session on logout
  async logout(shopId) {
    if (shopId) {
      await deleteShopSession(shopId)
    }
  },

  // Refresh the access token using a valid refresh token
  async updateRates(shopId, { bwRate, colorRate }) {
    return await shopRepository.updateById(shopId, { bwRate, colorRate })
  },

  // Update the shop's printer settings
  async updatePrinters(shopId, printerData) {
    return await shopRepository.updateById(shopId, printerData)
  },

  // Update the shop's profile information (phone & email are locked and cannot be changed)
  async updateProfile(shopId, profileData) {
    const updatePayload = {}
    if (profileData.shopName) updatePayload.shopName = profileData.shopName
    if (profileData.ownerName) updatePayload.ownerName = profileData.ownerName
    if (profileData.address || profileData.shopAddress) updatePayload.address = profileData.address || profileData.shopAddress
    if (profileData.cityState) updatePayload.cityState = profileData.cityState
    if (profileData.pincode) updatePayload.pincode = profileData.pincode

    return await shopRepository.updateById(shopId, updatePayload)
  },

  // Change the shop's password after verifying the current password
  async changePassword(shopId, { currentPassword, newPassword }) {
    const shop = await shopRepository.findById(shopId, { includePassword: true })
    if (!shop) throw new Error('Shop not found')

    const shopWithPassword = await shopRepository.findByEmail(shop.email, { includePassword: true })
    const isMatch = await comparePassword(currentPassword, shopWithPassword.passwordHash)
    if (!isMatch) throw new Error('Current password is incorrect')

    const passwordHash = await hashPassword(newPassword)
    await shopRepository.updateById(shopId, { passwordHash })
    return { success: true }
  },

  // Update the shop's payment settings (bcrypt-encrypt razorpayKeySecret)
  async updatePaymentSettings(shopId, paymentData) {
    const { razorpayKeySecret, razorpayKeyId, paymentMode, paymentGateway } = paymentData

    const updateFields = {
      'paymentSettings.paymentMode': paymentMode || 'online_counter',
      'paymentSettings.paymentGateway': paymentGateway || 'razorpay',
    }

    // Save Key ID as-is (not secret, used in frontend checkout)
    if (razorpayKeyId !== undefined) {
      updateFields['paymentSettings.razorpayKeyId'] = String(razorpayKeyId || '').trim()
    }

    // Bcrypt hash the Key Secret before saving
    if (razorpayKeySecret) {
      const hashedSecret = await hashPassword(razorpayKeySecret)
      updateFields['paymentSettings.razorpayKeySecret'] = hashedSecret
      updateFields['paymentSettings.isRazorpayConfigured'] = true
    }

    const updatedShop = await shopRepository.updateById(shopId, updateFields)
    memoryCache.invalidateShop(shopId)

    // Strip hashed secret from response (never expose to frontend)
    if (updatedShop?.paymentSettings) {
      updatedShop.paymentSettings.razorpayKeySecret = undefined
    }

    return updatedShop
  },

  // Submit a review for a shop
  async submitReview(shopId, reviewData) {
    const shop = await shopRepository.findById(shopId)
    if (!shop) throw new Error('Shop not found')

    const updatedShop = await shopRepository.updateById(
      shopId,
      {
        $push: {
          reviews: {
            username: reviewData.username || shop.ownerName,
            state: reviewData.state || '',
            stars: reviewData.stars || 5,
            review: reviewData.review || '',
            createdAt: new Date(),
          },
        },
      },
      { returnDocument: 'after' }
    )
    return updatedShop
  },

  // Get all public reviews across shops, sorted by most recent
  async getAllPublicReviews() {
    const shops = await shopRepository.findAll(
      { 'reviews.0': { $exists: true } },
      { shopName: 1, ownerName: 1, cityState: 1, reviews: 1 }
    )
    const reviews = []
    for (const shop of shops) {
      for (const r of shop.reviews) {
        reviews.push({
          id: r._id,
          username: r.username || shop.ownerName,
          shopName: shop.shopName,
          cityState: shop.cityState || '',
          stars: r.stars || 5,
          review: r.review || '',
          createdAt: r.createdAt || new Date(),
        })
      }
    }
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return reviews.slice(0, 50)
  },

}