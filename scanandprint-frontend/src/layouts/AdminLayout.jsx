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
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin-login')
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin-login')
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex font-sans">
      
      {/* DESKTOP ADMIN SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-stone-950 border-r border-stone-800 sticky top-0 h-screen justify-between z-30">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                  QR <span className="text-brand">PrintPe</span>
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                  Super Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Platform Status Badge */}
          <div className="mx-4 my-4 p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-300">System Healthy</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
              99.9% Uptime
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1 mt-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-rose-500/25 font-extrabold'
                        : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
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

        {/* Footer Logout */}
        <div className="p-4 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="btn btn-outline w-auto !text-rose-400 !bg-rose-950/40 hover:!bg-rose-900/60 !border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-900">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-ghost btn-sm lg:hidden p-2 text-stone-300 hover:!bg-stone-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-extrabold text-lg text-white">Super Admin Management</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-full text-xs text-stone-300 font-bold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>128 Active Shops Connected</span>
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-base text-white">Admin Panel</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm p-1.5 text-stone-400 hover:!bg-stone-800">
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
                          `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
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
                className="btn btn-outline w-auto !text-rose-400 !bg-rose-950/40 !border-rose-900/40 hover:!bg-rose-900/60"
              >
                <LogOut className="w-4 h-4" />
                <span>Admin Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
