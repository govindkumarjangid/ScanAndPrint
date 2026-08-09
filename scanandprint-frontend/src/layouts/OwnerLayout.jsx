import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Printer, QrCode, LogOut, Menu, X, CheckCircle2, ownerNavItems } from '../assets/assets'
import { motion, AnimatePresence } from 'framer-motion'
import { OwnerLogo } from '../components/ui/OwnerLogo'

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const isAgentConnected = true
  const shopCode = 'SHOP_98234'
  const shopName = 'Sharma Cyber Cafe'

  const handleLogout = () => {
    navigate('/shop-login');
  }

  return (
    <div className="min-h-screen bg-stone-100/70 flex font-sans text-stone-800">

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
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Content container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* header */}
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

          {/* Status Actions */}
          <div className="flex items-center gap-3">
            <Link to="/owner/qr-code">
              <button className="hidden sm:flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                <QrCode className="w-4 h-4 text-brand" />
                <span>Show Shop QR</span>
              </button>
            </Link>

            <Link to="/owner/agent">
              <button className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Print Agent Online</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* mobile sidebar */}
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
