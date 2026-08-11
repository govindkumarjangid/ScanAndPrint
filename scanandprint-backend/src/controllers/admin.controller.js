import Admin from '../models/Admin.model.js'
import AdminSettings from '../models/AdminSettings.model.js'
import Shop from '../models/Shop.model.js'
import PrintAgent from '../models/PrintAgent.model.js'
import PrintJob from '../models/PrintJob.model.js'
import { generateToken } from '../utils/jwt.util.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return sendError(res, 401, 'Invalid admin credentials')
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return sendError(res, 401, 'Invalid admin credentials')
    }

    const token = generateToken({ adminId: admin._id }, '24h')

    res.cookie('adminAccessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, 
    })

    return sendSuccess(res, 200, 'Admin logged in successfully', {
      admin: {
        id: admin._id,
        email: admin.email
      },
      token
    })
  } catch (error) {
    return sendError(res, 500, 'Error logging in admin', error.message)
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments()
    const totalAgents = await PrintAgent.countDocuments()
    
    // Revenue calculations (assuming print job price/revenue tracking exists, else mock for now)
    const jobs = await PrintJob.find({ status: 'completed' })
    const totalPrints = jobs.length
    
    // Simplistic revenue calculation
    let totalRevenue = 0
    jobs.forEach(job => {
      // Suppose each job has a total amount, otherwise we mock it based on pages
      totalRevenue += (job.files ? job.files.length * 5 : 5) 
    })

    return sendSuccess(res, 200, 'Stats fetched successfully', {
      totalShops,
      totalAgents,
      totalPrints,
      totalRevenue,
      activeUsers: Math.floor(Math.random() * 50) + 10 // Mock active users
    })
  } catch (error) {
    return sendError(res, 500, 'Error fetching stats', error.message)
  }
}

export const getShops = async (req, res) => {
  try {
    const shops = await Shop.find().select('-password').sort({ createdAt: -1 })
    
    // We should also attach agent count or job count if needed
    // For simplicity, just return shops
    return sendSuccess(res, 200, 'Shops fetched successfully', shops)
  } catch (error) {
    return sendError(res, 500, 'Error fetching shops', error.message)
  }
}

export const getAgents = async (req, res) => {
  try {
    const agents = await PrintAgent.find().populate('shop', 'shopName email').sort({ createdAt: -1 })
    return sendSuccess(res, 200, 'Agents fetched successfully', agents)
  } catch (error) {
    return sendError(res, 500, 'Error fetching agents', error.message)
  }
}

export const getTransactions = async (req, res) => {
  try {
    const transactions = await PrintJob.find().populate('shop', 'shopName').sort({ createdAt: -1 }).limit(100)
    return sendSuccess(res, 200, 'Transactions fetched successfully', transactions)
  } catch (error) {
    return sendError(res, 500, 'Error fetching transactions', error.message)
  }
}

export const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne()
    if (!settings) {
      settings = await AdminSettings.create({})
    }
    return sendSuccess(res, 200, 'Settings fetched successfully', settings)
  } catch (error) {
    return sendError(res, 500, 'Error fetching settings', error.message)
  }
}

export const updateSettings = async (req, res) => {
  try {
    const updateData = req.body
    let settings = await AdminSettings.findOne()
    if (!settings) {
      settings = await AdminSettings.create(updateData)
    } else {
      Object.assign(settings, updateData)
      await settings.save()
    }
    return sendSuccess(res, 200, 'Settings updated successfully', settings)
  } catch (error) {
    return sendError(res, 500, 'Error updating settings', error.message)
  }
}
