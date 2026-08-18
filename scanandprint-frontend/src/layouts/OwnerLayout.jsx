import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Printer, QrCode, LogOut, Menu, X, CheckCircle2, AlertCircle, ownerNavItems } from '../assets/assets'
import { Loader2, Clock, Sparkles, Zap, ArrowRight, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OwnerLogo } from '../components/ui/OwnerLogo'
import { useAuthStore } from '../store/useAuthStore'
import { getSocket } from '../lib/socket'
import api from '../lib/axios'

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [demoTimeLeft, setDemoTimeLeft] = useState('')
  const [isDemoExpired, setIsDemoExpired] = useState(false)
  const [isAgentConnected, setIsAgentConnected] = useState(false)

  const navigate = useNavigate()
  const { currentShop, isAuthenticated, fetchProfile, logout } = useAuthStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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

        {/* 2-Hour Free Demo Active Banner */}
        {currentShop?.isDemoAccount && !isDemoExpired && (
          <div className="bg-linear-to-r from-amber-500 to-amber-600 text-stone-950 px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-xs z-30">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <Clock className="w-4 h-4 text-stone-950 animate-pulse" />
              <span>
                Free Demo Trial Active: <span className="font-mono bg-black/10 px-2 py-0.5 rounded-md text-stone-950 font-extrabold">{demoTimeLeft}</span> remaining
              </span>
            </div>
            <Link to="/pricing" className="hidden sm:inline-flex items-center gap-1 bg-stone-950 text-white px-3 py-1 rounded-xl text-[11px] font-extrabold hover:bg-black transition-colors">
              <span>Upgrade Plan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
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

          <div className="flex items-center gap-3">
            <Link to="/owner/qr-code">
              <button className="hidden sm:flex btn btn-secondary btn-sm bg-stone-100 hover:bg-stone-200 border-transparent text-stone-800">
                <QrCode className="w-4 h-4 text-brand" />
                <span>Show Shop QR</span>
              </button>
            </Link>

            <Link to="/owner/agent">
              {isAgentConnected ? (
                <button className="hidden sm:flex btn btn-sm bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Print Agent Online</span>
                </button>
              ) : (
                <button className="hidden sm:flex btn btn-sm bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Print Agent Offline</span>
                </button>
              )}
            </Link>
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
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 35, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 flex flex-col justify-between p-4 border-r border-stone-200 lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div className="font-extrabold text-base text-stone-900">
                      Scan<span className="text-brand">&Print</span>
                      <span className="text-xs text-stone-500 font-medium block">Owner Panel</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-full text-stone-500 hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-6 h-6" />
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

      {/* STRICT DEMO EXPIRATION MODAL LOCK */}
      <AnimatePresence>
        {isDemoExpired && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-stone-200 flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 text-brand flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-extrabold text-stone-900 font-heading">
                  Demo Trial Expired ⌛
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your 2-Hour free demo trial period has completed. Upgrade to a subscription plan to continue using the auto-print software, kiosk, and desktop agent.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <Link to="/pricing" className="w-full">
                  <button className="btn btn-primary w-full py-4 shadow-lg flex items-center justify-center gap-2 text-sm font-bold">
                    <span>Upgrade to Monthly (₹399) / Lifetime (₹599)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-bold"
                >
                  Sign Out of Demo Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}