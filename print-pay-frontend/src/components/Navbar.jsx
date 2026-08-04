import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Printer, Menu, X, KeyRound, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'How to Setup', path: '/how-to-setup' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-md border-b border-stone-200/60 py-3'
          : 'bg-[#FFFBF7]/90 py-4'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F0245C] to-[#ff4d7e] flex items-center justify-center text-white shadow-md shadow-[#F0245C]/20 group-hover:scale-105 transition-transform duration-200">
            <Printer className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-stone-900 leading-none">
              QR Se <span className="text-[#F0245C]">Print</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase mt-0.5">
              Smart Print Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/50">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#F0245C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/shop-login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-[#F0245C] hover:bg-[#D81B4E] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md shadow-[#F0245C]/25 transition-all duration-200 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>🔑 Shop Login</span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200/60 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 md:hidden"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#FFFBF7] z-50 shadow-2xl p-6 flex flex-col justify-between md:hidden border-l border-stone-200"
            >
              <div>
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0245C] text-white flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-stone-900">
                      QR Se <span className="text-[#F0245C]">Print</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'bg-[#F0245C]/10 text-[#F0245C] font-bold'
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
                <Link to="/shop-login" className="w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-[#F0245C] text-white py-3 rounded-full font-bold shadow-md shadow-[#F0245C]/20"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>🔑 Shop Login</span>
                  </motion.button>
                </Link>
                <Link to="/register" className="w-full">
                  <button className="w-full py-3 rounded-full font-semibold border border-stone-300 text-stone-800 hover:bg-stone-100 text-center">
                    Register Shop
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
