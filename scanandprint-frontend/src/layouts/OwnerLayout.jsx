import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Printer, QrCode, LogOut, Menu, X, CheckCircle2, AlertCircle, ownerNavItems } from '../assets/assets'
import { Loader2, Clock, Sparkles, Zap, ArrowRight, Lock, ShieldCheck, RefreshCw, Check } from 'lucide-react'
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
  const [selectedRenewPlan, setSelectedRenewPlan] = useState('MONTHLY_399')

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

  const monthlyPrice = publicSettings?.monthlyPrice || 399
  const lifetimePrice = publicSettings?.lifetimePrice || 599

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

  // Live 2-Hour Demo Countdown Timer Calculation
  useEffect(() => {
    if (!currentShop?.isDemoAccount || !currentShop?.demoExpiresAt) {
      setIsDemoExpired(false)
      return
    }

    const updateTimer = () => {
      const expiryTime = new Date(currentShop.demoExpiresAt).getTime()
      const now = Date.now()
      const diffMs = expiryTime - now

      if (diffMs <= 0) {
        setDemoTimeLeft('00:00:00')
        setIsDemoExpired(true)
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

        const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        setDemoTimeLeft(formatted)
        setIsDemoExpired(false)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentShop])

  // Subscription Plan Status & Expiry Calculations
  const isDemo = Boolean(currentShop?.isDemoAccount)
  const isLifetime = currentShop?.planType === 'LIFETIME_599'
  let daysLeft = null
  let isPlanExpired = false

  if (!isDemo && !isLifetime) {
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

      const orderData = await createSubscriptionOrder(planType || selectedRenewPlan)

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'QR PrintPe',
        description: `Renew ${planType === 'LIFETIME_599' ? 'Lifetime' : 'Monthly'} Subscription`,
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
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <OwnerLogo />
          </div>

          {/* Navigation tabs */}
          <nav className="px-4 space-y-1 mt-2">
            {ownerNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
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
            className="btn btn-outline w-full !text-rose-600 !border-rose-200 hover:!bg-rose-50 flex items-center justify-center gap-2 text-xs font-bold"
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
              onClick={() => handleRenewSubscription('MONTHLY_399')}
              className="hidden sm:inline-flex items-center gap-1 bg-stone-950 text-white px-3 py-1 rounded-xl text-[11px] font-extrabold hover:bg-black transition-colors cursor-pointer"
            >
              <span>Upgrade Plan (₹{monthlyPrice})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 2. Advance Expiry Warning Banner (When 1-3 days left) */}
        {!isDemo && !isLifetime && daysLeft !== null && daysLeft > 0 && daysLeft <= 3 && !isPlanExpired && (
          <div className="bg-linear-to-r from-amber-500 via-rose-500 to-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md z-30">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <Clock className="w-4 h-4 text-white animate-bounce" />
              <span>
                ⚠️ Your Monthly Plan expires in <strong>{daysLeft} day{daysLeft > 1 ? 's' : ''}</strong>. Renew now to avoid any printing interruption!
              </span>
            </div>
            <button
              onClick={() => handleRenewSubscription('MONTHLY_399')}
              disabled={isRenewing}
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-brand px-3.5 py-1 rounded-xl text-[11px] font-extrabold hover:bg-rose-50 shadow-sm transition-colors cursor-pointer"
            >
              {isRenewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>Renew Now (₹{monthlyPrice})</span>
            </button>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-full text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex flex-col">
              <h2 className="font-extrabold text-lg text-stone-900 leading-snug">{shopName}</h2>
              <span className="text-xs text-stone-500 font-medium">Cyber Café & Automated Printing</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Subscription Badge */}
            {isLifetime ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Lifetime Plan</span>
              </span>
            ) : isDemo ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>2-Hour Trial</span>
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                isPlanExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isPlanExpired ? 'Plan Expired' : 'Monthly Active'}</span>
              </span>
            )}

            {/* Desktop Agent Live Status Badge */}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAgentConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className={isAgentConnected ? 'text-emerald-700' : 'text-stone-500'}>
                {isAgentConnected ? 'Agent Live' : 'Agent Offline'}
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
                <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-6">
                  <OwnerLogo />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-700"
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
                          `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
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
                className="btn btn-outline w-full !text-rose-600 !border-rose-200 hover:!bg-rose-50 flex items-center justify-center gap-2 text-xs font-bold"
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
                  onClick={() => setSelectedRenewPlan('MONTHLY_399')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedRenewPlan === 'MONTHLY_399'
                      ? 'border-brand bg-rose-50/70 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRenewPlan === 'MONTHLY_399' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                    }`}>
                      {selectedRenewPlan === 'MONTHLY_399' && <Check className="w-3 h-3 stroke-3" />}
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

                {/* Lifetime Upgrade Option */}
                <div
                  onClick={() => setSelectedRenewPlan('LIFETIME_599')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                    selectedRenewPlan === 'LIFETIME_599'
                      ? 'border-brand bg-rose-50/70 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-brand text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                    Best Value
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRenewPlan === 'LIFETIME_599' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                    }`}>
                      {selectedRenewPlan === 'LIFETIME_599' && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1">
                        <span>Lifetime Access</span>
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="text-[11px] text-stone-500">Pay Once, Never Expire</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-stone-900">₹{lifetimePrice}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">One-time</div>
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
                      <span>Pay ₹{selectedRenewPlan === 'LIFETIME_599' ? lifetimePrice : monthlyPrice} & Unlock Dashboard 💳</span>
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

    </div>
  )
}