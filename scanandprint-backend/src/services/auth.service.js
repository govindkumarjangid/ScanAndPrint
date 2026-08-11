import { shopRepository } from '../repositories/shop.repository.js'
import { hashPassword, comparePassword } from '../utils/password.util.js'
import { generateToken } from '../utils/jwt.util.js'
import { generateShopCode, generateSecretApiKey } from '../utils/shopCode.util.js'
import Admin from '../models/Admin.model.js'

export const authService = {
  async register(data) {
    const { password, shopName, email, mobile, fullName, shopAddress, ...rest } = data

    // Check if exists
    const existing = await shopRepository.findByPhoneOrEmail(email, mobile, { lean: true })
    if (existing) {
      throw new Error('A shop account with this email or mobile number already exists')
    }

    const passwordHash = await hashPassword(password)
    const shopCode = generateShopCode(shopName)
    const secretApiKey = generateSecretApiKey()

    const newShop = await shopRepository.create({
      ...rest,
      shopName,
      ownerName: fullName, // mapping
      address: shopAddress, // mapping
      email: email.toLowerCase(),
      phone: mobile,
      passwordHash,
      shopCode,
      secretApiKey,
    })

    return this._generateAuthTokens(newShop)
  },

  async login({ email, password }) {
    const shop = await shopRepository.findByEmail(email, { includePassword: true })
    if (!shop) throw new Error('Invalid email or password credentials')

    const isPasswordValid = await comparePassword(password, shop.passwordHash)
    if (!isPasswordValid) throw new Error('Invalid email or password credentials')

    return this._generateAuthTokens(shop)
  },

  async adminLogin({ email, password }) {
    if (email !== 'scanqrandprint@gmail.com') {
      throw new Error('Invalid admin email');
    }

    let admin = await Admin.findOne({ email });
    if (!admin) {
      // Auto-seed the admin if it doesn't exist
      admin = new Admin({ email, password: 'adminofscanandprint@2026' });
      await admin.save();
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid admin credentials');
    }

    const payload = { adminId: admin._id, role: 'superadmin' };
    const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '2h');
    
    return { accessToken, admin: { email: admin.email, role: 'superadmin' } };
  },

  _generateAuthTokens(shop) {
    const payload = {
      shopId: shop._id,
      shopCode: shop.shopCode,
      email: shop.email,
    }

    const accessToken = generateToken(payload, process.env.JWT_EXPIRES_IN || '15m')
    const refreshToken = generateToken(payload, '7d')

    const shopResponse = shop.toObject ? shop.toObject() : { ...shop }
    delete shopResponse.passwordHash

    return { accessToken, refreshToken, shop: shopResponse }
  },

  async updateRates(shopId, { bwRate, colorRate }) {
    return await shopRepository.updateById(shopId, { bwRate, colorRate })
  },

  async updatePrinters(shopId, printerData) {
    return await shopRepository.updateById(shopId, printerData)
  }
}
