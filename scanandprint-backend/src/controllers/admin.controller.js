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

import { activeAgentsMap } from '../socket.js'

// get all shops with pagination & search
export const getShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query
  const query = {}

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i')
    query.$or = [{ shopName: regex }, { shopCode: regex }, { email: regex }, { phone: regex }]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [shops, totalCount] = await Promise.all([
    Shop.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Shop.countDocuments(query),
  ])

  return sendSuccess(res, 200, 'Shops fetched successfully', {
    shops,
    pagination: {
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      limit: Number(limit),
    },
  })
})

// get all agents (Strictly 1 row per shop with Live In-Memory Socket data & system details)
export const getAgents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query
  const query = {}

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i')
    query.$or = [{ shopName: regex }, { shopCode: regex }, { email: regex }]
  }

  // Fetch all shops from DB
  const shops = await Shop.find(query)
    .select('shopName ownerName email phone shopCode address cityState connectedPrinters isOnline lastHeartbeatAt createdAt')
    .sort({ createdAt: -1 })
    .lean()

  // Map each shop with its LIVE Socket and system info
  const mappedAgents = shops.map((shop) => {
    const cleanCode = String(shop.shopCode || '').trim().toUpperCase()
    const isSocketOnline = activeAgentsMap.has(cleanCode) || activeAgentsMap.has(String(shop._id))
    const agentData = activeAgentsMap.get(cleanCode) || activeAgentsMap.get(String(shop._id))

    const isRecentHeartbeat = shop.isOnline && shop.lastHeartbeatAt && ((Date.now() - new Date(shop.lastHeartbeatAt).getTime()) < 90000)
    const isOnline = Boolean(isSocketOnline || isRecentHeartbeat)

    return {
      _id: shop._id,
      shopId: {
        _id: shop._id,
        shopName: shop.shopName,
        email: shop.email,
        shopCode: shop.shopCode,
        phone: shop.phone,
        address: shop.address || shop.cityState || 'Local Store',
      },
      socketId: agentData?.socketId ? `${agentData.socketId.slice(0, 10)}...` : (isOnline ? 'Active' : 'Offline'),
      ipAddress: agentData?.ipAddress || (isOnline ? '127.0.0.1 (Localhost)' : '—'),
      agentVersion: agentData?.agentVersion || 'v1.0.0',
      osArch: agentData?.osArch || 'win32 (64-bit)',
      connectedPrinters: agentData?.printers?.length ? agentData.printers : (shop.connectedPrinters || []),
      isConnected: isOnline,
      isOnline: isOnline,
      lastHeartbeatAt: agentData?.connectedAt || shop.lastHeartbeatAt || null,
      createdAt: shop.createdAt,
    }
  })

  // Filter by online/offline if requested
  let filtered = mappedAgents
  if (status === 'ONLINE') {
    filtered = mappedAgents.filter((a) => a.isOnline)
  } else if (status === 'OFFLINE') {
    filtered = mappedAgents.filter((a) => !a.isOnline)
  }

  const totalCount = filtered.length
  const skip = (Number(page) - 1) * Number(limit)
  const paginatedAgents = filtered.slice(skip, skip + Number(limit))

  return sendSuccess(res, 200, 'Agents fetched successfully', {
    agents: paginatedAgents,
    pagination: {
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      limit: Number(limit),
    },
  })
})

// get all transactions with pagination & status filtering
export const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query
  const query = {}

  if (status && status !== 'ALL') {
    query.status = status
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i')
    query.$or = [{ jobId: regex }, { shopCode: regex }, { customerPhone: regex }, { originalFileName: regex }]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [transactions, totalCount] = await Promise.all([
    PrintJob.find(query)
      .populate('shopId', 'shopName email shopCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    PrintJob.countDocuments(query),
  ])

  return sendSuccess(res, 200, 'Transactions fetched successfully', {
    transactions,
    pagination: {
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)) || 1,
      limit: Number(limit),
    },
  })
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
