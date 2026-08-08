import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

export default function MainLayout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFBF7]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-grow"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
