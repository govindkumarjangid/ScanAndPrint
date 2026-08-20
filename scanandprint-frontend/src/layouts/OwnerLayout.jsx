import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Printer, QrCode, LogOut, Menu, X, CheckCircle2, AlertCircle, ownerNavItems } from '../assets/assets'
import { Loader2, Clock, Sparkles, Zap, ArrowRight, Lock, ShieldCheck, ShieldAlert, RefreshCw, Check, Rocket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OwnerLogo } from '../components/ui/OwnerLogo'
import { useAuthStore } from '../store/useAuthStore'
import { getSocket } from '../lib/socket'
import { loadRazorpayScript } from '../lib/razorpay'
import toast from 'react-hot-toast'
import api from '../lib/axios'

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [demoTimeLeft, setDemoTimeLeft] = useState('')
  const [isDemoExpired, setIsDemoExpired] = useState(false)
  const [isAgentConnected, setIsAgentConnected] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [selectedRenewPlan, setSelectedRenewPlan] = useState('MONTHLY_299')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState('YEARLY_799')

  const navigate = useNavigate()
  const {
    currentShop,
    isAuthenticated,
    publicSettings,
    fetchPublicSettings,
    fetchProfile,
    logout,
    createSubscriptionOrder,
    verifySubscriptionPayment,
  } = useAuthStore()

  useEffect(() => {
    fetchProfile()
    fetchPublicSettings()
  }, [fetchProfile, fetchPublicSettings])

  const monthlyPrice = publicSettings?.monthlyPrice || 299
  const yearlyPrice = publicSettings?.yearlyPrice || 799

  // Real-time Agent Socket Connection (Pure Socket.IO - 0 API Polling Overhead)
  useEffect(() => {
    const shopCode = currentShop?.shopCode || currentShop?._id
    if (!shopCode) return

    const socket = getSocket()
    const joinRoom = () => {
      socket.emit('JOIN_SHOP_DASHBOARD', { shopCode })
      socket.emit('CHECK_AGENT_STATUS', { shopCode })
    }

    if (socket.connected) {
      joinRoom()
    }
    socket.on('connect', joinRoom)

    const handleAgentStatus = (data) => {
      if (data?.shopCode && data.shopCode !== shopCode) return
      setIsAgentConnected(Boolean(data?.isOnline))
    }

    socket.on('AGENT_STATUS_CHANGE', handleAgentStatus)

    return () => {
      socket.off('connect', joinRoom)
      socket.off('AGENT_STATUS_CHANGE', handleAgentStatus)
    }
  }, [currentShop?.shopCode, currentShop?._id])

  const isDemo = Boolean(currentShop?.isDemoAccount)
  const isYearly = currentShop?.planType === 'YEARLY_799'
  const isDemoEnded = isDemo && (!currentShop?.demoExpiresAt || new Date(currentShop.demoExpiresAt).getTime() <= Date.now())

  const expiryFormatted = currentShop?.subscriptionExpiresAt
    ? new Date(currentShop.subscriptionExpiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : null

  const expiryShort = currentShop?.subscriptionExpiresAt
    ? new Date(currentShop.subscriptionExpiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
    : null

  let daysLeft = null
  let isPlanExpired = false

  if (isDemo) {
    if (isDemoEnded || isDemoExpired) {
      isPlanExpired = true
    }
  } else {
    if (currentShop?.subscriptionExpiresAt) {
      const diffMs = new Date(currentShop.subscriptionExpiresAt).getTime() - Date.now()
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffMs <= 0 || currentShop.subscriptionStatus === 'EXPIRED') {
        isPlanExpired = true
      }
    } else if (
      currentShop?.subscriptionStatus === 'PENDING_PAYMENT' ||
      currentShop?.subscriptionStatus === 'EXPIRED' ||
      !currentShop?.isSubscriptionActive
    ) {
      isPlanExpired = true
    }
  }

  const [liveCountdown, setLiveCountdown] = useState(null)

  // Live Real-Time Countdown Timer (Hours, Minutes, Seconds) for Demo & Active Monthly/Yearly Subscriptions
  useEffect(() => {
    if (!currentShop) {
      setLiveCountdown(null)
      setIsDemoExpired(false)
      return
    }

    const updateTimer = () => {
      const targetExpiry = currentShop?.isDemoAccount
        ? currentShop?.demoExpiresAt
        : currentShop?.subscriptionExpiresAt

      if (!targetExpiry) {
        setLiveCountdown(null)
        return
      }

      const expiryTime = new Date(targetExpiry).getTime()
      const now = Date.now()
      const diffMs = expiryTime - now

      if (diffMs <= 0) {
        setLiveCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          formattedDesktop: '00h 00m 00s',
          formattedMobile: '00:00:00',
        })
        if (currentShop?.isDemoAccount) {
          setIsDemoExpired(true)
          setDemoTimeLeft('00:00:00')
        }
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

        const pad = (n) => String(n).padStart(2, '0')

        let formattedDesktop = ''
        let formattedMobile = ''

        if (currentShop?.isDemoAccount) {
          formattedDesktop = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
          formattedMobile = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
          setDemoTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
          setIsDemoExpired(false)
        } else if (days > 0) {
          formattedDesktop = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
          formattedMobile = `${days}d ${pad(hours)}h`
        } else {
          formattedDesktop = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
          formattedMobile = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        }

        setLiveCountdown({
          days,
          hours,
          minutes,
          seconds,
          formattedDesktop,
          formattedMobile,
        })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentShop])

  const isDashboardLocked = isDemoExpired || isPlanExpired

  // 1-Click Instant Razorpay Renewal Trigger
  const handleRenewSubscription = async (planType) => {
    try {
      setIsRenewing(true)
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.')
        setIsRenewing(false)
        return
      }

      const orderData = await createSubscriptionOrder(planType || selectedRenewPlan, currentShop?._id)

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'Scan&Print',
        description: `Renew ${planType === 'YEARLY_799' ? 'Yearly' : 'Monthly'} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: currentShop?.ownerName || currentShop?.shopName,
          email: currentShop?.email,
          contact: currentShop?.phone,
        },
        theme: {
          color: '#F0245C',
        },
        handler: async (response) => {
          try {
            await verifySubscriptionPayment({
              shopId: currentShop?._id,
              planType: planType || selectedRenewPlan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            await fetchProfile()
            toast.success('🎉 Subscription Renewed Successfully! Full Dashboard Unlocked.')
          } catch (vErr) {
            toast.error(vErr.message || 'Signature verification failed.')
          } finally {
            setIsRenewing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsRenewing(false)
            toast.error('Payment cancelled. Please complete renewal to unlock dashboard.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (failRes) => {
        setIsRenewing(false)
        toast.error(failRes.error?.description || 'Payment failed. Please try again.')
      })
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Failed to start renewal payment')
      setIsRenewing(false)
    }
  }

  const shopName = currentShop?.shopName || 'Cyber Cafe'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100/70 flex font-sans text-stone-800 relative">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-stone-200/80 sticky top-0 h-screen justify-between z-30 shadow-xs">
        <div>
          {/* Logo */}
          <div className="pl-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
            <OwnerLogo />
          </div>

          {/* Navigation tabs */}
          <nav className="px-4 space-y-1 mt-4">
            {ownerNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive
                      ? 'bg-brand text-white shadow-md shadow-rose-500/20'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-outline w-full text-rose-600! border-rose-200! hover:bg-rose-50! flex items-center justify-center gap-2 text-xs font-bold"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Content container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 1. 2-Hour Free Demo Active Banner */}
        {currentShop?.isDemoAccount && !isDemoExpired && (
          <div className="bg-linear-to-r from-amber-500 to-amber-600 text-stone-950 px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-xs z-30">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <Clock className="w-4 h-4 text-stone-950 animate-pulse" />
              <span>
                Free Demo Trial Active: <span className="font-mono bg-black/10 px-2 py-0.5 rounded-md text-stone-950 font-extrabold">{demoTimeLeft}</span> remaining
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-stone-950 text-white px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold hover:bg-black transition-colors cursor-pointer shadow-xs"
            >
              <span>Upgrade Plan 🚀</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Advance Expiry Warning Banner (When 1-3 days left) */}
        {!isDemo && daysLeft !== null && daysLeft > 0 && daysLeft <= 3 && !isPlanExpired && (
          <div className="bg-linear-to-r from-amber-500 via-rose-500 to-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md z-30">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <Clock className="w-4 h-4 text-white animate-bounce" />
              <span>
                ⚠️ Your {isYearly ? 'Yearly' : 'Monthly'} Plan expires in <strong>{daysLeft} day{daysLeft > 1 ? 's' : ''}</strong>. Renew now to avoid any printing interruption!
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              disabled={isRenewing}
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-brand px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew / Upgrade Plan</span>
            </button>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-stone-700 hover:bg-stone-100 cursor-pointer shrink-0 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex flex-col min-w-0">
              <h2 className="font-extrabold text-sm sm:text-lg text-stone-900 leading-tight truncate max-w-32.5 xs:max-w-[190px] sm:max-w-none">
                {shopName}
              </h2>
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium hidden sm:block truncate">
                Cyber Café & Automated Printing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Subscription Badge with Expiry Date & Remaining Time */}
            {isDemo ? (
              <span
                title={`2-Hour Demo Free Trial · ${liveCountdown?.formattedDesktop || demoTimeLeft || '00:00:00'} remaining`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0 font-mono"
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 shrink-0" />
                <span className="hidden sm:inline">Demo: {liveCountdown?.formattedDesktop || demoTimeLeft || '00:00:00'}</span>
                <span className="sm:hidden">{liveCountdown?.formattedMobile || demoTimeLeft || '00:00:00'}</span>
              </span>
            ) : isPlanExpired ? (
              <span
                title={`Subscription expired on ${expiryFormatted || 'N/A'}`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs shrink-0"
              >
                <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Expired {expiryFormatted ? `(${expiryFormatted})` : ''}</span>
                <span className="sm:hidden">Expired</span>
              </span>
            ) : isYearly ? (
              <span
                title={`Yearly Active Subscription (₹799/yr) · Valid till ${expiryFormatted || 'N/A'}`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs shrink-0"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 fill-amber-400 shrink-0" />
                <span className="hidden sm:inline">
                  Yearly · Till {expiryFormatted} · <span className="font-mono">{liveCountdown?.formattedDesktop || `${daysLeft}d left`}</span>
                </span>
                <span className="sm:hidden font-mono">
                  {liveCountdown?.formattedMobile || `Till ${expiryShort || `${daysLeft}d`}`}
                </span>
              </span>
            ) : (
              <span
                title={`Monthly Active Subscription (₹299/mo) · Valid till ${expiryFormatted || 'N/A'}`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs shrink-0"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">
                  Monthly · Till {expiryFormatted} · <span className="font-mono">{liveCountdown?.formattedDesktop || `${daysLeft}d left`}</span>
                </span>
                <span className="sm:hidden font-mono">
                  {liveCountdown?.formattedMobile || `Till ${expiryShort || `${daysLeft}d`}`}
                </span>
              </span>
            )}

            {/* Desktop Agent Live Status Badge */}
            <div
              title={isAgentConnected ? 'Desktop Print Agent is online' : 'Desktop Print Agent is offline'}
              className="flex items-center gap-1.5 sm:gap-2 bg-stone-50 border border-stone-200/80 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold shrink-0"
            >
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${isAgentConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
              />
              <span className={`hidden sm:inline ${isAgentConnected ? 'text-emerald-700' : 'text-stone-500'}`}>
                {isAgentConnected ? 'Agent Live' : 'Agent Offline'}
              </span>
              <span className={`sm:hidden ${isAgentConnected ? 'text-emerald-700' : 'text-stone-500'}`}>
                {isAgentConnected ? 'Live' : 'Off'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-stone-200 p-6 flex flex-col justify-between z-50 lg:hidden shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-6">
                  <OwnerLogo />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-700 cursor-pointer transition-colors rounded-xl hover:bg-stone-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {ownerNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                            ? 'bg-brand text-white shadow-md'
                            : 'text-stone-700 hover:bg-stone-100'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-outline w-full text-rose-600! border-rose-200! hover:bg-rose-50! flex items-center justify-center gap-2 text-xs font-bold"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* STRICT SUBSCRIPTION EXPIRATION / ACTIVATION LOCKOUT MODAL */}
      <AnimatePresence>
        {isDashboardLocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-stone-200 flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 text-brand flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full w-max mx-auto">
                  {isDemoExpired ? 'Trial Period Ended' : 'Subscription Expired / Inactive'}
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900 font-heading mt-1">
                  Dashboard Access Locked 🔒
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                  {isDemoExpired
                    ? 'Your 2-Hour free trial has ended. Renew your plan below to unlock your Owner Dashboard, Customer Kiosk, and Print Agent.'
                    : 'Your shop subscription has expired. Please renew your plan below to continue receiving customer print jobs.'}
                </p>
              </div>

              {/* Plan Choice Cards */}
              <div className="w-full flex flex-col gap-2.5 text-left">
                {/* Monthly Renewal Option */}
                <div
                  onClick={() => setSelectedRenewPlan('MONTHLY_299')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedRenewPlan === 'MONTHLY_299'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRenewPlan === 'MONTHLY_299' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                      }`}>
                      {selectedRenewPlan === 'MONTHLY_299' && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-stone-900">Monthly Renewal</div>
                      <div className="text-[11px] text-stone-500">Full Access for 30 Days</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-stone-900">₹{monthlyPrice}</div>
                    <div className="text-[10px] text-stone-500">/ month</div>
                  </div>
                </div>

                {/* Yearly Upgrade Option */}
                <div
                  onClick={() => setSelectedRenewPlan('YEARLY_799')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${selectedRenewPlan === 'YEARLY_799'
                    ? 'border-brand bg-rose-50/70 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                >
                  <div className="absolute top-0 right-0 bg-brand text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                    Best Value · Save 78%
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRenewPlan === 'YEARLY_799' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                      }`}>
                      {selectedRenewPlan === 'YEARLY_799' && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1">
                        <span>Yearly Plan (1 Year)</span>
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="text-[11px] text-stone-500">365 Days Access & Priority Help</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-stone-900">₹{yearlyPrice}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">1 Year</div>
                  </div>
                </div>
              </div>

              {/* Instant Razorpay Pay Button */}
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => handleRenewSubscription(selectedRenewPlan)}
                  disabled={isRenewing}
                  className="btn btn-primary w-full py-3.5 shadow-lg flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
                >
                  {isRenewing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{selectedRenewPlan === 'YEARLY_799' ? yearlyPrice : monthlyPrice} & Unlock Dashboard 💳</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant automated activation via Razorpay</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost w-full py-2 text-xs text-stone-500 hover:text-stone-800 font-bold mt-1"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. VOLUNTARY UPGRADE / RENEWAL PLAN SELECTION MODAL (MONTHLY VS YEARLY) */}
      <AnimatePresence>
        {showUpgradeModal && !isDashboardLocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 flex flex-col gap-5 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-1 text-center pr-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full w-max mx-auto">
                  Upgrade Subscription
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heading mt-1 flex items-center justify-center gap-4 ">
                  Choose Your Plan <Rocket className="w-5 h-5 fill-brand text-brand" />
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Select between Monthly or Yearly access to continue uninterrupted printing after your demo.
                </p>
              </div>

              {/* Plan Choice Cards */}
              <div className="w-full flex flex-col gap-3 text-left">
                {/* 1. Monthly Option */}
                <div
                  onClick={() => setSelectedUpgradePlan('MONTHLY_299')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedUpgradePlan === 'MONTHLY_299'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUpgradePlan === 'MONTHLY_299'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-stone-300'
                        }`}
                    >
                      {selectedUpgradePlan === 'MONTHLY_299' && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-stone-900">Monthly Plan</span>
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Renews monthly</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">Full owner dashboard, live kiosk & print agent</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-stone-900">₹{monthlyPrice}</div>
                    <div className="text-[10px] text-stone-500 font-semibold">/ 30 days</div>
                  </div>
                </div>

                {/* 2. Yearly Option */}
                <div
                  onClick={() => setSelectedUpgradePlan('YEARLY_799')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${selectedUpgradePlan === 'YEARLY_799'
                      ? 'border-brand bg-rose-50/70 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                >
                  <div className="absolute top-0 right-0 bg-brand text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                    Best Value · Save 78%
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUpgradePlan === 'YEARLY_799'
                          ? 'border-brand bg-brand text-white'
                          : 'border-stone-300'
                        }`}
                    >
                      {selectedUpgradePlan === 'YEARLY_799' && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-stone-900">Yearly Plan</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">365 Days access — priority setup & poster</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-stone-900">₹{yearlyPrice}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">1 Year</div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await handleRenewSubscription(selectedUpgradePlan)
                    setShowUpgradeModal(false)
                  }}
                  disabled={isRenewing}
                  className="btn btn-primary w-full py-3.5 shadow-lg flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
                >
                  {isRenewing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{selectedUpgradePlan === 'YEARLY_799' ? yearlyPrice : monthlyPrice} & Upgrade ({selectedUpgradePlan === 'YEARLY_799' ? 'Yearly' : 'Monthly'}) 💳</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by 256-bit encrypted Razorpay Payment Gateway</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}