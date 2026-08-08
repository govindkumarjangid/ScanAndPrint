import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { createPortal } from 'react-dom'
import { Printer, Menu, X, KeyRound, ChevronRight, navLinks } from '../assets/assets'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from "./ui/Logo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setIsScrolled(true)
      else setIsScrolled(false)
      if (mobileMenuOpen) setMobileMenuOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 border-none ${isScrolled
      ? 'glass-nav shadow-md border-b border-stone-200/60 py-3'
      : 'bg-brand-bg/90 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/50 relative">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${isActive ? 'text-brand font-bold' : 'text-stone-600 hover:text-stone-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-white rounded-full shadow-xs z-0"
                      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/shop-login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>Shop Login</span>
            </motion.button>
          </Link>
        </div>

        {/* menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-stone-900/70 backdrop-blur-md z-98 md:hidden"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                  style={{ backgroundColor: '#FFFBF7' }}
                  className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-99 shadow-2xl p-5 flex flex-col justify-between md:hidden border-l border-stone-200 overflow-y-auto"
                >
                  <div>
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
                      <Logo />
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600 cursor-pointer"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${isActive
                              ? 'bg-brand-light text-brand font-bold'
                              : 'text-stone-700 hover:bg-stone-100'
                            }`
                          }
                        >
                          <span>{link.name}</span>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </NavLink>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-200 flex flex-col gap-3">
                    <Link to="/shop-login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 btn-primary py-3"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Shop Login</span>
                      </motion.button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-full font-semibold border border-stone-300 text-stone-800 hover:bg-stone-100 text-center cursor-pointer">
                        Register Shop
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  )
}