import { Shop } from '../models/Shop.model.js'
import { hashPassword, comparePassword } from '../utils/password.util.js'
import { generateToken } from '../utils/jwt.util.js'
import { generateShopCode, generateSecretApiKey } from '../utils/shopCode.util.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

/**
 * Register a new Shop & Shop Owner
 * POST /api/auth/register
 */
export const registerShop = async (req, res, next) => {
  try {
    const {
      fullName,
      mobile,
      email,
      password,
      shopName,
      shopAddress,
      pincode,
      cityState,
      printerBrand,
      bwRate,
      colorRate,
    } = req.body

    // Input Validation
    if (!email || !password || !shopName || !fullName || !mobile || !shopAddress) {
      return sendError(res, 400, 'Please fill in all required fields (fullName, mobile, email, password, shopName, shopAddress)')
    }

    // Check if email or mobile already registered
    const existingShop = await Shop.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: mobile }],
    }).lean()

    if (existingShop) {
      return sendError(res, 409, 'A shop account with this email or mobile number already exists')
    }

    // Hash Password & Generate Unique Credentials
    const passwordHash = await hashPassword(password)
    const shopCode = generateShopCode(shopName)
    const secretApiKey = generateSecretApiKey()

    // Create Shop Document
    const newShop = await Shop.create({
      shopCode,
      shopName,
      ownerName: fullName,
      email: email.toLowerCase(),
      phone: mobile,
      passwordHash,
      secretApiKey,
      address: shopAddress,
      pincode: pincode || '',
      cityState: cityState || '',
      printerBrand: printerBrand || 'Epson',
      bwRate: Number(bwRate) || 5.0,
      colorRate: Number(colorRate) || 10.0,
    })

    // Generate Access JWT Token
    const token = generateToken({
      shopId: newShop._id,
      shopCode: newShop.shopCode,
      email: newShop.email,
    })

    // Prepare Response Object
    const shopResponse = {
      _id: newShop._id,
      shopCode: newShop.shopCode,
      shopName: newShop.shopName,
      ownerName: newShop.ownerName,
      email: newShop.email,
      phone: newShop.phone,
      address: newShop.address,
      pincode: newShop.pincode,
      cityState: newShop.cityState,
      printerBrand: newShop.printerBrand,
      bwRate: newShop.bwRate,
      colorRate: newShop.colorRate,
      secretApiKey: newShop.secretApiKey,
      planType: newShop.planType,
      isOnline: newShop.isOnline,
    }

    return sendSuccess(res, 201, 'Shop registered successfully! Welcome to QR PrintPe.', {
      token,
      shop: shopResponse,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login Shop Owner
 * POST /api/auth/login
 */
export const loginShop = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password')
    }

    // Fast indexed query fetching passwordHash explicitly
    const shop = await Shop.findOne({ email: email.toLowerCase() }).select('+passwordHash')

    if (!shop) {
      return sendError(res, 401, 'Invalid email or password credentials')
    }

    // Verify Password
    const isPasswordValid = await comparePassword(password, shop.passwordHash)
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password credentials')
    }

    // Generate Access JWT Token
    const token = generateToken({
      shopId: shop._id,
      shopCode: shop.shopCode,
      email: shop.email,
    })

    const shopResponse = shop.toObject()
    delete shopResponse.passwordHash

    return sendSuccess(res, 200, 'Login successful!', {
      token,
      shop: shopResponse,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get Authenticated Shop Profile
 * GET /api/auth/me
 */
export const getShopProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Shop profile fetched successfully', { shop: req.shop })
  } catch (error) {
    next(error)
  }
}

/**
 * Update Shop Print Rates (B&W vs Color)
 * PUT /api/auth/rates
 */
export const updateShopRates = async (req, res, next) => {
  try {
    const { bwRate, colorRate } = req.body

    if (bwRate === undefined || colorRate === undefined) {
      return sendError(res, 400, 'Please provide both bwRate and colorRate')
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.shop._id,
      {
        bwRate: Number(bwRate),
        colorRate: Number(colorRate),
      },
      { new: true, runValidators: true }
    ).lean()

    return sendSuccess(res, 200, 'Print rates updated successfully', { shop: updatedShop })
  } catch (error) {
    next(error)
  }
}

/**
 * Update Printer Mapping (B&W and Color Printer Names)
 * PUT /api/auth/printers
 */
export const updateShopPrinters = async (req, res, next) => {
  try {
    const { defaultBwPrinter, defaultColorPrinter, printerBrand } = req.body

    const updatedShop = await Shop.findByIdAndUpdate(
      req.shop._id,
      {
        ...(defaultBwPrinter !== undefined && { defaultBwPrinter }),
        ...(defaultColorPrinter !== undefined && { defaultColorPrinter }),
        ...(printerBrand !== undefined && { printerBrand }),
      },
      { new: true }
    ).lean()

    return sendSuccess(res, 200, 'Printers mapped successfully', { shop: updatedShop })
  } catch (error) {
    next(error)
  }
}
