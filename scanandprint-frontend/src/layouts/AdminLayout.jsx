import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import {
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Activity,
  adminNavItems,
} from '../assets/assets'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLogo } from '../components/ui/AdminLogo'
import { useAdminStore } from '../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('adminSidebarCollapsed') === 'true'
    } catch {
      return false
    }
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { overviewData, fetchOverview } = useAdminStore()

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  const toggleCollapse = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    try {
      localStorage.setItem('adminSidebarCollapsed', String(nextState))
    } catch (e) {
      console.warn(e)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      localStorage.removeItem('adminToken')
      toast.success('Admin signed out successfully')
      setTimeout(() => {
        navigate('/admin-login')
      }, 500)
    } catch (err) {
      console.error(err)
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin-login')
    }
  }, [navigate])

  const totalConnected = overviewData?.totalAgents ?? overviewData?.totalShops ?? 0

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex font-sans">

      {/* DESKTOP ADMIN SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col bg-stone-950 border-r border-stone-800 sticky top-0 h-screen justify-between z-30 transition-all duration-300 ${
          isCollapsed ? 'w-18' : 'w-65'
        }`}
      >
        {/* Floating Chevron Collapse / Expand Button placed at header divider baseline */}
        <button
          type="button"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="absolute -right-3.5 bottom-20 z-40 w-7 h-7 rounded-full bg-stone-900 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-200 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="flex flex-col">
          {/* Logo (No bottom border, icon locked in position and centered) */}
          <div className="px-3 pt-5 pb-2 flex items-center">
            <Link to="/admin/dashboard" title="Scan&Print Super Admin" className="flex items-center gap-3.5 group cursor-pointer">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-stone-700/60 group-hover:scale-105 transition-transform duration-200">
                  <img src="/svgs/logo.svg" alt="Scan&Print Logo" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shadow-sm border border-stone-950">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
              </div>
              <div className={`flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                  Scan<span className="text-brand">&Print</span>
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                  Super Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links (Icons locked in place) */}
          <nav className="px-3 space-y-1.5 mt-3">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center h-12 rounded-2xl text-sm font-bold transition-all duration-200 group px-3.5 overflow-hidden ${
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-rose-500/25 font-extrabold'
                        : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                  <span className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                  }`}>
                    {item.name}
                  </span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer Logout Button (Icon exactly matched & locked with nav items) */}
        <div className="p-3 border-t border-stone-800/80 w-full">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={isCollapsed ? 'Admin Sign Out' : undefined}
            className="flex items-center h-12 px-3.5 rounded-2xl w-full text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 transition-all duration-200 overflow-hidden cursor-pointer group"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin text-rose-400 shrink-0" />
            ) : (
              <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
            )}
            <span className={`ml-3.5 whitespace-nowrap overflow-hidden transition-all duration-300 font-bold text-sm ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}>
              {isLoggingOut ? 'Signing Out...' : 'Admin Sign Out'}
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-900">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-ghost btn-sm lg:hidden p-2 text-stone-300 hover:bg-stone-800!"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-extrabold text-lg text-white">Super Admin Management</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-full text-xs text-stone-300 font-bold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>
                {totalConnected} {totalConnected === 1 ? 'Shop' : 'Shops'} Live Connected
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-stone-950 z-50 flex flex-col justify-between p-4 border-r border-stone-800 lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                  <AdminLogo />
                  <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm p-1.5 text-stone-400 hover:bg-stone-800!">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                            ? 'bg-brand text-white shadow-md'
                            : 'text-stone-400 hover:bg-stone-900'
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
                className="btn btn-outline w-auto text-rose-400! bg-rose-950/40! border-rose-900/40! hover:bg-rose-900/60! flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? 'Signing Out...' : 'Admin Sign Out'}</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
