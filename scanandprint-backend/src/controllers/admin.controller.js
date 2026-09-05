import Admin from '../models/Admin.model.js'
import AdminSettings from '../models/AdminSettings.model.js'
import { Shop } from '../models/Shop.model.js'
import { PrintAgent } from '../models/PrintAgent.model.js'
import { PrintJob } from '../models/PrintJob.model.js'
import { SubscriptionPayment } from '../models/SubscriptionPayment.model.js'
import { Device } from '../models/Device.model.js'
import { generateToken } from '../utils/jwt.util.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { activeAgentsMap } from '../socket.js'
import { invalidatePublicSettingsCache } from './auth.controller.js'

export const escapeRegex = (text) => String(text || '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

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

// shop plan type, subscription status, and online status
const resolveShopStatusAndPlan = (shop) => {
  const cleanCode = String(shop.shopCode || '').trim().toUpperCase()
  const isSocketOnline = activeAgentsMap.has(cleanCode) || activeAgentsMap.has(String(shop._id))
  const isRecentHeartbeat = shop.isOnline && shop.lastHeartbeatAt && ((Date.now() - new Date(shop.lastHeartbeatAt).getTime()) < 90000)
  const isOnline = Boolean(isSocketOnline || isRecentHeartbeat)

  const isDemo = Boolean(shop.isDemoAccount || shop.planType === 'FREE_TRIAL')
  let planType = shop.planType || (isDemo ? 'FREE_TRIAL' : 'MONTHLY_299')
  if (isDemo) planType = 'FREE_TRIAL'

  let demoExpiresAt = shop.demoExpiresAt
  if (isDemo && !demoExpiresAt && shop.createdAt) {
    demoExpiresAt = new Date(new Date(shop.createdAt).getTime() + 48 * 60 * 60 * 1000)
  }

  let status = 'Active'
  if (shop.isSuspended) {
    status = 'Suspended'
  } else if (isDemo) {
    const isDemoExpired = demoExpiresAt ? (new Date(demoExpiresAt).getTime() <= Date.now()) : false
    status = isDemoExpired ? 'Demo Expired' : 'Demo Active'
  } else if (shop.subscriptionStatus === 'EXPIRED' || (shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() <= Date.now())) {
    status = 'Expired'
  } else if (shop.subscriptionStatus === 'PENDING_PAYMENT' || !shop.isSubscriptionActive) {
    status = 'Pending'
  } else {
    status = 'Active'
  }

  return {
    planType,
    status,
    isOnline,
    isSuspended: Boolean(shop.isSuspended),
    isDemoAccount: isDemo,
    demoExpiresAt,
    subscriptionExpiresAt: shop.subscriptionExpiresAt,
  }
}

// complete analytics for charts and telemetry
const computeAnalyticsPayload = (allShops = [], allJobs = [], subscriptionPayments = [], statusBreakdownAgg = []) => {
  const now = new Date()
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000).getTime()

  // Plan Breakdown & Expiring List
  let freeTrialCount = 0
  let monthlyCount = 0
  let yearlyCount = 0
  const expiringSoonShops = []

  allShops.forEach((s) => {
    const { planType, demoExpiresAt, subscriptionExpiresAt, isOnline } = resolveShopStatusAndPlan(s)
    if (planType === 'FREE_TRIAL' || s.isDemoAccount) {
      freeTrialCount++
      if (demoExpiresAt) {
        const expTime = new Date(demoExpiresAt).getTime()
        if (expTime > now.getTime() && expTime <= twoDaysFromNow) {
          expiringSoonShops.push({
            id: s._id,
            shopName: s.shopName,
            ownerName: s.ownerName,
            phone: s.phone,
            shopCode: s.shopCode,
            planType: 'FREE_TRIAL',
            expiresAt: demoExpiresAt,
            isOnline,
            type: 'Free Demo Trial',
          })
        }
      }
    } else if (planType === 'YEARLY_799') {
      yearlyCount++
      if (subscriptionExpiresAt) {
        const expTime = new Date(subscriptionExpiresAt).getTime()
        if (expTime > now.getTime() && expTime <= twoDaysFromNow) {
          expiringSoonShops.push({
            id: s._id,
            shopName: s.shopName,
            ownerName: s.ownerName,
            phone: s.phone,
            shopCode: s.shopCode,
            planType: 'YEARLY_799',
            expiresAt: subscriptionExpiresAt,
            isOnline,
            type: 'Yearly Plan',
          })
        }
      }
    } else {
      monthlyCount++
      if (subscriptionExpiresAt) {
        const expTime = new Date(subscriptionExpiresAt).getTime()
        if (expTime > now.getTime() && expTime <= twoDaysFromNow) {
          expiringSoonShops.push({
            id: s._id,
            shopName: s.shopName,
            ownerName: s.ownerName,
            phone: s.phone,
            shopCode: s.shopCode,
            planType: 'MONTHLY_299',
            expiresAt: subscriptionExpiresAt,
            isOnline,
            type: 'Monthly Plan',
          })
        }
      }
    }
  })

  // 7-Day Trend Timeline
  const dailyMap = new Map()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    dailyMap.set(dateStr, {
      date: dateStr,
      day: dayName,
      prints: 0,
      revenue: 0,
      jobs: 0,
      completedJobs: 0,
    })
  }

  allJobs.forEach((job) => {
    if (job.createdAt) {
      const dateStr = new Date(job.createdAt).toISOString().split('T')[0]
      const pages = Number(job.totalPages) || 1
      const copies = Number(job.copies) || 1
      const s = String(job.status || '').toUpperCase()
      const isPaid = ['PRINTED_SUCCESSFULLY', 'COMPLETED', 'PAID', 'PRINTING', 'DISPATCHED_TO_AGENT'].includes(s)
      const isDone = ['PRINTED_SUCCESSFULLY', 'COMPLETED'].includes(s)

      if (dailyMap.has(dateStr)) {
        const entry = dailyMap.get(dateStr)
        entry.prints += pages * copies
        entry.jobs += 1
        if (isPaid) entry.revenue += Number(job.totalAmount) || 0
        if (isDone) entry.completedJobs += 1
      } else {
        const oldestDateKey = Array.from(dailyMap.keys())[0]
        if (oldestDateKey) {
          const entry = dailyMap.get(oldestDateKey)
          entry.prints += pages * copies
          entry.jobs += 1
          if (isPaid) entry.revenue += Number(job.totalAmount) || 0
          if (isDone) entry.completedJobs += 1
        }
      }
    }
  })

  const dailyTrend = Array.from(dailyMap.values())

  // Job Status Breakdown (Aggregated from MongoDB or computed from jobs)
  let completedCount = 0
  let printingCount = 0
  let failedCount = 0
  let pendingCount = 0

  if (Array.isArray(statusBreakdownAgg) && statusBreakdownAgg.length > 0) {
    statusBreakdownAgg.forEach(({ _id, count }) => {
      const st = String(_id || '').toUpperCase()
      if (['PRINTED_SUCCESSFULLY', 'COMPLETED'].includes(st)) {
        completedCount += count
      } else if (['PRINTING', 'DISPATCHED_TO_AGENT', 'DOWNLOADING'].includes(st)) {
        printingCount += count
      } else if (['FAILED', 'CANCELLED', 'PRINT_FAILED'].includes(st)) {
        failedCount += count
      } else {
        pendingCount += count
      }
    })
  } else {
    allJobs.forEach((j) => {
      const st = String(j.status || '').toUpperCase()
      if (['PRINTED_SUCCESSFULLY', 'COMPLETED'].includes(st)) {
        completedCount++
      } else if (['PRINTING', 'DISPATCHED_TO_AGENT', 'DOWNLOADING'].includes(st)) {
        printingCount++
      } else if (['FAILED', 'CANCELLED', 'PRINT_FAILED'].includes(st)) {
        failedCount++
      } else {
        pendingCount++
      }
    })
  }

  // Platform Subscription Revenue
  let subscriptionRevenue = 0
  subscriptionPayments.forEach((p) => {
    subscriptionRevenue += Number(p.amount) || 0
  })

  // Conversion Rate
  const totalPaidShops = monthlyCount + yearlyCount
  const totalHistoricalShops = allShops.length || 1
  const conversionRate = Math.round((totalPaidShops / totalHistoricalShops) * 100)

  return {
    dailyTrend,
    planBreakdown: [
      { name: 'Free Demo (48-Hr)', value: freeTrialCount, color: '#f59e0b' },
      { name: 'Monthly (₹299)', value: monthlyCount, color: '#f43f5e' },
      { name: 'Yearly (₹799)', value: yearlyCount, color: '#a855f7' },
    ],
    statusBreakdown: [
      { name: 'Printed Successfully', value: completedCount, color: '#10b981' },
      { name: 'Active / Printing', value: printingCount, color: '#3b82f6' },
      { name: 'Pending Payment', value: pendingCount, color: '#f59e0b' },
      { name: 'Failed / Cancelled', value: failedCount, color: '#ef4444' },
    ],
    metrics: {
      freeTrialCount,
      monthlyCount,
      yearlyCount,
      subscriptionRevenue,
      conversionRate,
      expiringSoonCount: expiringSoonShops.length,
    },
    expiringSoonShops,
  }
}

// get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalShops,
    allShopsRaw,
    jobAggResult,
    statusBreakdownAgg,
    recentJobs,
    subscriptionPayments,
  ] = await Promise.all([
    Shop.countDocuments(),
    Shop.find()
      .select('shopName ownerName email phone shopCode createdAt planType isOnline lastHeartbeatAt cityState address subscriptionStatus isSubscriptionActive isDemoAccount demoExpiresAt subscriptionExpiresAt')
      .lean(),
    // Database-level Aggregation Pipeline for fast, memory-safe lifetime totals
    PrintJob.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalPrints: {
            $sum: {
              $multiply: [
                { $ifNull: ['$totalPages', 1] },
                { $ifNull: ['$copies', 1] },
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['PRINTED_SUCCESSFULLY', 'COMPLETED', 'PAID', 'PRINTING', 'DISPATCHED_TO_AGENT']] },
                { $ifNull: ['$totalAmount', 0] },
                0,
              ],
            },
          },
          completedJobsCount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['PRINTED_SUCCESSFULLY', 'COMPLETED']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    // Lifetime status breakdown aggregated in DB
    PrintJob.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Query ONLY the last 7 days of jobs for the weekly trend chart (saves huge RAM)
    PrintJob.find({ createdAt: { $gte: sevenDaysAgo } })
      .select('totalPages copies totalAmount status createdAt')
      .lean(),
    SubscriptionPayment.find({ status: 'SUCCESS' })
      .select('amount planType createdAt')
      .lean(),
  ])

  const agg = jobAggResult[0] || {}
  const totalJobs = agg.totalJobs || 0
  const totalPrints = agg.totalPrints || 0
  const totalRevenue = agg.totalRevenue || 0
  const completedJobsCount = agg.completedJobsCount || 0

  // Count distinct live connected agents
  const onlineShopCodes = new Set()
  for (const [key, val] of activeAgentsMap.entries()) {
    if (val?.shopCode) onlineShopCodes.add(String(val.shopCode).toUpperCase())
  }
  allShopsRaw.forEach((s) => {
    const clean = String(s.shopCode || '').toUpperCase()
    const isRecent = s.isOnline && s.lastHeartbeatAt && ((Date.now() - new Date(s.lastHeartbeatAt).getTime()) < 90000)
    if (isRecent) onlineShopCodes.add(clean)
  })
  const totalAgents = onlineShopCodes.size

  // Recent shops with accurate resolved status & planType
  const recentShopsRaw = await Shop.find()
    .select('shopName ownerName email phone shopCode createdAt planType isOnline lastHeartbeatAt cityState address subscriptionStatus isSubscriptionActive isDemoAccount demoExpiresAt subscriptionExpiresAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const recentShops = recentShopsRaw.map((shop) => {
    const { planType, status, isOnline } = resolveShopStatusAndPlan(shop)
    return {
      ...shop,
      planType,
      status,
      isOnline,
      isDemoAccount: Boolean(shop.isDemoAccount),
      demoExpiresAt: shop.demoExpiresAt,
      subscriptionExpiresAt: shop.subscriptionExpiresAt,
    }
  })

  // Compute analytics using recentJobs for trend & statusBreakdownAgg for lifetime status
  const analytics = computeAnalyticsPayload(allShopsRaw, recentJobs, subscriptionPayments, statusBreakdownAgg)

  return sendSuccess(res, 200, 'Stats fetched successfully', {
    stats: {
      totalShops,
      totalAgents,
      totalJobs,
      totalPrints,
      completedJobsCount,
      totalRevenue,
    },
    recentShops,
    analytics,
  })
})

// get all shops with pagination & search
export const getShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query
  const query = {}

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i')
    query.$or = [{ shopName: regex }, { shopCode: regex }, { email: regex }, { phone: regex }]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [shopsRaw, totalCount] = await Promise.all([
    Shop.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Shop.countDocuments(query),
  ])

  const shops = shopsRaw.map((shop) => {
    const { planType, status, isOnline } = resolveShopStatusAndPlan(shop)
    return {
      ...shop,
      planType,
      status,
      isOnline,
      isDemoAccount: Boolean(shop.isDemoAccount),
      demoExpiresAt: shop.demoExpiresAt,
      subscriptionExpiresAt: shop.subscriptionExpiresAt,
    }
  })

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

// get all agents
export const getAgents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query
  const query = {}

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i')
    query.$or = [{ shopName: regex }, { shopCode: regex }, { email: regex }]
  }

  // Fetch all shops and stored PrintAgent records from DB
  const [shops, dbAgents] = await Promise.all([
    Shop.find(query)
      .select('shopName ownerName email phone shopCode address cityState connectedPrinters isOnline lastHeartbeatAt createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    PrintAgent.find().sort({ updatedAt: -1 }).lean(),
  ])

  // Map PrintAgent records by string shopId
  const dbAgentMap = new Map()
  dbAgents.forEach((ag) => {
    if (ag.shopId) {
      dbAgentMap.set(String(ag.shopId), ag)
    }
  })

  // Map each shop with its LIVE Socket and system info
  const mappedAgents = shops.map((shop) => {
    const cleanCode = String(shop.shopCode || '').trim().toUpperCase()
    const isSocketOnline = activeAgentsMap.has(cleanCode) || activeAgentsMap.has(String(shop._id))
    const liveAgentData = activeAgentsMap.get(cleanCode) || activeAgentsMap.get(String(shop._id))
    const dbAgentData = dbAgentMap.get(String(shop._id))

    const isRecentHeartbeat = shop.isOnline && shop.lastHeartbeatAt && ((Date.now() - new Date(shop.lastHeartbeatAt).getTime()) < 90000)
    const isOnline = Boolean(isSocketOnline || isRecentHeartbeat || (dbAgentData && dbAgentData.isConnected))

    // Resolved real metadata from live socket or database record
    const resolvedSocketId = liveAgentData?.socketId || dbAgentData?.socketId || null
    const resolvedIp = liveAgentData?.ipAddress || dbAgentData?.ipAddress || (isOnline ? '127.0.0.1' : '—')
    const rawVersion = liveAgentData?.agentVersion || dbAgentData?.agentVersion || '1.0.3'
    const resolvedVersion = String(rawVersion).replace(/^v+/i, '')
    const resolvedPlatform = liveAgentData?.osPlatform || dbAgentData?.osPlatform || 'Windows (x64)'
    const resolvedPrinters = (liveAgentData?.printers && liveAgentData.printers.length > 0)
      ? liveAgentData.printers
      : ((shop.connectedPrinters && shop.connectedPrinters.length > 0) ? shop.connectedPrinters : [])

    return {
      _id: dbAgentData?._id || shop._id,
      shopId: {
        _id: shop._id,
        shopName: shop.shopName,
        email: shop.email,
        shopCode: shop.shopCode,
        phone: shop.phone,
        address: shop.address || shop.cityState || 'Local Store',
      },
      socketId: resolvedSocketId ? `${resolvedSocketId.slice(0, 10)}...` : (isOnline ? 'Active' : '—'),
      rawSocketId: resolvedSocketId || '—',
      ipAddress: resolvedIp,
      agentVersion: resolvedVersion,
      osPlatform: resolvedPlatform,
      osArch: resolvedPlatform,
      connectedPrinters: resolvedPrinters,
      isConnected: isOnline,
      isOnline: isOnline,
      lastHeartbeatAt: liveAgentData?.connectedAt || dbAgentData?.connectedAt || shop.lastHeartbeatAt || null,
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
    const regex = new RegExp(escapeRegex(search.trim()), 'i')
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

  invalidatePublicSettingsCache()

  const io = req.app.get('io')
  if (io)
    io.emit('GLOBAL_SETTINGS_UPDATED', settings)

  return sendSuccess(res, 200, 'Settings updated successfully', settings)
})

// Comprehensive Analytics for Charts & Telemetry
export const getAnalytics = asyncHandler(async (req, res) => {
  const [allShops, allJobs, subscriptionPayments] = await Promise.all([
    Shop.find().select('shopName ownerName email phone shopCode createdAt planType isDemoAccount demoExpiresAt subscriptionExpiresAt isSubscriptionActive subscriptionStatus isOnline').lean(),
    PrintJob.find().select('totalPages copies totalAmount status createdAt').lean(),
    SubscriptionPayment.find({ status: 'SUCCESS' }).select('amount planType createdAt').lean(),
  ])

  const analytics = computeAnalyticsPayload(allShops, allJobs, subscriptionPayments)
  return sendSuccess(res, 200, 'Analytics fetched successfully', analytics)
})

// Extend Demo Trial for a shop
export const extendDemoTrial = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { hours = 48 } = req.body

  const shop = await Shop.findById(id)
  if (!shop) return sendError(res, 404, 'Shop not found')

  const baseTime = shop.demoExpiresAt && new Date(shop.demoExpiresAt).getTime() > Date.now()
    ? new Date(shop.demoExpiresAt).getTime()
    : Date.now()

  shop.demoExpiresAt = new Date(baseTime + Number(hours) * 60 * 60 * 1000)
  shop.isDemoAccount = true
  shop.planType = 'FREE_TRIAL'
  shop.subscriptionStatus = 'ACTIVE'
  shop.isSubscriptionActive = true
  await shop.save()

  // Real-time WebSocket emission to Shop & Admin rooms (guaranteed delivery)
  const io = req.app.get('io')
  if (io) {
    const cleanCode = String(shop.shopCode).trim().toUpperCase()
    const payload = {
      shopId: shop._id,
      shopCode: cleanCode,
      planType: 'FREE_TRIAL',
      status: 'Demo Active',
      isDemoAccount: true,
      demoExpiresAt: shop.demoExpiresAt,
      isSuspended: false,
    }
    io.to(`shop:${cleanCode}`).emit('SHOP_STATUS_UPDATED', payload)
    io.to(`shop:${shop._id}`).emit('SHOP_STATUS_UPDATED', payload)
    io.to('admin:room').emit('ADMIN_SHOP_UPDATED', payload)
  }

  return sendSuccess(res, 200, `Demo trial extended by ${hours} hours successfully`, {
    shopId: shop._id,
    demoExpiresAt: shop.demoExpiresAt,
  })
})

// Update Shop Plan manually
export const updateShopPlan = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { planType, days = 30, isSubscriptionActive = true } = req.body

  const shop = await Shop.findById(id)
  if (!shop) return sendError(res, 404, 'Shop not found')

  shop.planType = planType
  shop.isSubscriptionActive = Boolean(isSubscriptionActive)
  shop.subscriptionStatus = isSubscriptionActive ? 'ACTIVE' : 'EXPIRED'

  if (planType === 'FREE_TRIAL') {
    shop.isDemoAccount = true
    let settings = await AdminSettings.findOne().lean()
    const defaultHours = Number(settings?.demoDurationHours) > 0 ? Number(settings.demoDurationHours) : 48
    const grantHours = Number(days) > 0 ? Number(days) * 24 : defaultHours
    const baseDemoTime = shop.demoExpiresAt && new Date(shop.demoExpiresAt).getTime() > Date.now()
      ? new Date(shop.demoExpiresAt).getTime()
      : Date.now()
    shop.demoExpiresAt = new Date(baseDemoTime + grantHours * 60 * 60 * 1000)
  } else {
    shop.isDemoAccount = false
    const baseSubTime = shop.subscriptionExpiresAt && new Date(shop.subscriptionExpiresAt).getTime() > Date.now()
      ? new Date(shop.subscriptionExpiresAt).getTime()
      : Date.now()
    shop.subscriptionExpiresAt = new Date(baseSubTime + Number(days) * 24 * 60 * 60 * 1000)
  }

  await shop.save()

  // Real-time WebSocket emission to Shop & Admin rooms (guaranteed delivery)
  const io = req.app.get('io')
  if (io) {
    const cleanCode = String(shop.shopCode).trim().toUpperCase()
    const payload = {
      shopId: shop._id,
      shopCode: cleanCode,
      planType: shop.planType,
      status: shop.isDemoAccount ? 'Demo Active' : (isSubscriptionActive ? 'Active' : 'Expired'),
      isDemoAccount: shop.isDemoAccount,
      demoExpiresAt: shop.demoExpiresAt,
      subscriptionExpiresAt: shop.subscriptionExpiresAt,
      isSuspended: Boolean(shop.isSuspended),
    }
    io.to(`shop:${cleanCode}`).emit('SHOP_STATUS_UPDATED', payload)
    io.to(`shop:${shop._id}`).emit('SHOP_STATUS_UPDATED', payload)
    io.to('admin:room').emit('ADMIN_SHOP_UPDATED', payload)
  }

  return sendSuccess(res, 200, 'Shop plan updated successfully', {
    shopId: shop._id,
    planType: shop.planType,
    demoExpiresAt: shop.demoExpiresAt,
    subscriptionExpiresAt: shop.subscriptionExpiresAt,
  })
})

// Toggle Shop Status (Suspend / Activate)
export const toggleShopStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { isSuspended } = req.body

  const shop = await Shop.findById(id)
  if (!shop) return sendError(res, 404, 'Shop not found')

  if (isSuspended !== undefined) {
    shop.isSuspended = Boolean(isSuspended)
  } else {
    shop.isSuspended = !shop.isSuspended
  }

  await shop.save()

  // Real-time WebSocket emission to Shop & Admin rooms
  const io = req.app.get('io')
  if (io) {
    const shopRoom = `shop:${shop.shopCode}`
    const payload = {
      shopId: shop._id,
      shopCode: shop.shopCode,
      isSuspended: shop.isSuspended,
      status: shop.isSuspended ? 'Suspended' : 'Active',
      reason: shop.isSuspended
        ? 'Your shop account has been suspended by Administrator.'
        : 'Your shop account has been reactivated by Administrator.',
    }

    // Send live status update to Shop room
    io.to(shopRoom).emit('SHOP_STATUS_UPDATED', payload)

    // If suspended, emit FORCE_SHOP_LOGOUT to kick owner out and AGENT_SUSPENDED to disconnect agent
    if (shop.isSuspended) {
      console.log(`🚨 [Live Suspension]: Emitting FORCE_SHOP_LOGOUT & AGENT_SUSPENDED to room ${shopRoom}`)
      io.to(shopRoom).emit('FORCE_SHOP_LOGOUT', payload)
      io.to(shopRoom).emit('AGENT_SUSPENDED', payload)

      const cleanShopCode = String(shop.shopCode).toUpperCase()
      if (activeAgentsMap.has(cleanShopCode)) {
        const agentRec = activeAgentsMap.get(cleanShopCode)
        activeAgentsMap.delete(cleanShopCode)
        if (agentRec?.shopId) activeAgentsMap.delete(String(agentRec.shopId))
      }
    }

    // Emit live update to Admin Dashboard room
    io.to('admin:room').emit('ADMIN_SHOP_UPDATED', payload)
  }

  return sendSuccess(res, 200, `Shop ${shop.isSuspended ? 'suspended' : 'activated'} successfully`, {
    shopId: shop._id,
    isSuspended: shop.isSuspended,
  })
})

// Get recent print jobs for a specific shop
export const getShopPrintJobs = asyncHandler(async (req, res) => {
  const { id } = req.params
  const jobs = await PrintJob.find({ shopId: id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return sendSuccess(res, 200, 'Shop print jobs fetched successfully', { jobs })
})

// Export all shops
export const exportAllShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find()
    .select('shopName ownerName email phone shopCode address cityState pincode planType isOnline createdAt isDemoAccount')
    .sort({ createdAt: -1 })
    .lean()

  return sendSuccess(res, 200, 'Shops export data retrieved', { shops })
})

// Export all transactions
export const exportAllTransactions = asyncHandler(async (req, res) => {
  const jobs = await PrintJob.find()
    .populate('shopId', 'shopName shopCode')
    .select('jobId shopCode customerPhone totalPages copies totalAmount status paymentMode createdAt originalFileName')
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean()

  return sendSuccess(res, 200, 'Transactions export data retrieved', { transactions: jobs })
})

// Delete Shop and all associated records (PrintJobs, PrintAgents, Devices, SubscriptionPayments)
export const deleteShop = asyncHandler(async (req, res) => {
  const { id } = req.params

  const shop = await Shop.findById(id)
  if (!shop) return sendError(res, 404, 'Shop not found')

  const shopCode = shop.shopCode
  const shopId = shop._id

  // Cascade delete associated records
  await Promise.all([
    PrintJob.deleteMany({ shopId }),
    PrintAgent.deleteMany({ shopId }),
    Device.deleteMany({ shopId }),
    SubscriptionPayment.deleteMany({ shopId }),
    Shop.findByIdAndDelete(id),
  ])

  // Real-time WebSocket emission to kick out owner & agent and notify admin dashboard
  const io = req.app.get('io')
  if (io) {
    const cleanShopCode = String(shopCode).toUpperCase()
    const shopRoom = `shop:${cleanShopCode}`
    const payload = {
      shopId,
      shopCode: cleanShopCode,
      isDeleted: true,
      reason: 'Your shop account has been deleted by Administrator.',
    }

    io.to(shopRoom).emit('FORCE_SHOP_LOGOUT', payload)
    io.to(`shop:${shopId}`).emit('FORCE_SHOP_LOGOUT', payload)
    io.to(shopRoom).emit('AGENT_SUSPENDED', payload)
    io.to(`shop:${shopId}`).emit('AGENT_SUSPENDED', payload)

    if (activeAgentsMap.has(cleanShopCode)) {
      const agentRec = activeAgentsMap.get(cleanShopCode)
      activeAgentsMap.delete(cleanShopCode)
      if (agentRec?.shopId) activeAgentsMap.delete(String(agentRec.shopId))
    }

    io.to('admin:room').emit('ADMIN_SHOP_DELETED', { shopId, shopCode: cleanShopCode })
  }

  return sendSuccess(res, 200, `Shop "${shop.shopName}" (${shopCode}) deleted successfully`, {
    shopId,
    shopCode,
  })
})

// Delete single transaction / print job
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params

  const job = await PrintJob.findById(id)
  if (!job) return sendError(res, 404, 'Transaction not found')

  await PrintJob.findByIdAndDelete(id)

  const io = req.app.get('io')
  if (io) {
    io.to('admin:room').emit('ADMIN_TRANSACTION_DELETED', { jobId: job._id })
  }

  return sendSuccess(res, 200, `Transaction ${job.jobId || id} deleted successfully`, {
    id,
    jobId: job.jobId,
  })
})
