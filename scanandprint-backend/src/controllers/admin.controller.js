import Admin from '../models/Admin.model.js'
import AdminSettings from '../models/AdminSettings.model.js'
import { Shop } from '../models/Shop.model.js'
import { PrintAgent } from '../models/PrintAgent.model.js'
import { PrintJob } from '../models/PrintJob.model.js'
import { generateToken } from '../utils/jwt.util.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// login admin
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const admin = await Admin.findOne({ email })
  if (!admin)
    return sendError(res, 401, 'Invalid admin credentials')

  const isMatch = await admin.comparePassword(password)
  if (!isMatch)
    return sendError(res, 401, 'Invalid admin credentials')

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
})

// get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalShops = await Shop.countDocuments()
  const totalAgents = await PrintAgent.countDocuments({ isConnected: true })

  // Find all completed or paid print jobs
  const completedJobs = await PrintJob.find({
    status: { $in: ['PRINTED_SUCCESSFULLY', 'COMPLETED', 'completed', 'PAID', 'PRINTING'] },
  }).lean()

  const allJobs = await PrintJob.find().lean()
  const totalPrints = allJobs.reduce((acc, job) => acc + (job.totalPages * (job.copies || 1) || 1), 0)

  let totalRevenue = 0
  completedJobs.forEach((job) => {
    totalRevenue += Number(job.totalAmount) || 0
  })

  // If no transactions yet, show platform base or 0
  const recentShops = await Shop.find()
    .select('shopName ownerName email shopCode createdAt planType isOnline cityState address')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  return sendSuccess(res, 200, 'Stats fetched successfully', {
    stats: {
      totalShops,
      totalAgents,
      totalPrints,
      totalRevenue,
    },
    recentShops,
  })
})

// get all shops
export const getShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean()
  return sendSuccess(res, 200, 'Shops fetched successfully', shops)
})

// get all agents (fixed populate to shopId)
export const getAgents = asyncHandler(async (req, res) => {
  const agents = await PrintAgent.find()
    .populate('shopId', 'shopName email shopCode isOnline connectedPrinters')
    .sort({ isConnected: -1, createdAt: -1 })
    .lean()
  return sendSuccess(res, 200, 'Agents fetched successfully', agents)
})

// get all transactions (fixed populate to shopId)
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await PrintJob.find()
    .populate('shopId', 'shopName email shopCode')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
  return sendSuccess(res, 200, 'Transactions fetched successfully', transactions)
})

// get subscription plans
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await AdminSettings.findOne()
  if (!settings)
    settings = await AdminSettings.create({})
  return sendSuccess(res, 200, 'Settings fetched successfully', settings)
})

// update subscription plans
export const updateSettings = asyncHandler(async (req, res) => {
  const updateData = req.body
  let settings = await AdminSettings.findOne()
  if (!settings) {
    settings = await AdminSettings.create(updateData)
  } else {
    Object.assign(settings, updateData)
    await settings.save()
  }
  return sendSuccess(res, 200, 'Settings updated successfully', settings)
})
