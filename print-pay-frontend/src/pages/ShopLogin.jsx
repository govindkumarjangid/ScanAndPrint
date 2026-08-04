import React, { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { Printer, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ShopLogin() {
  const location = useLocation()
  const registeredShopName = location.state?.registeredShopName

  const [shopId, setShopId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log('Shop Login attempt:', { shopId, password })
    setTimeout(() => {
      setIsSubmitting(false)
      setLoginSuccess(true)
    }, 600)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6">
        
        {/* Floating Printer Icon Loop */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F0245C] to-[#ff4d7e] text-white flex items-center justify-center shadow-xl shadow-[#F0245C]/30"
        >
          <Printer className="w-8 h-8 stroke-[2.2]" />
        </motion.div>

        {/* Success Alert Banner if just registered */}
        {registeredShopName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-emerald-800 text-xs text-center flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>{registeredShopName}</strong> successfully registered! Please log in below.</span>
          </motion.div>
        )}

        {/* Card */}
        <div className="w-full bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl flex flex-col gap-6 text-center">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 flex items-center justify-center gap-2">
              <span>🔒 Shop Owner Login</span>
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Enter your Shop ID and Password to continue
            </p>
          </div>

          {loginSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col items-center gap-3 text-emerald-900"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              <h3 className="font-extrabold text-lg">Login Successful!</h3>
              <p className="text-xs text-emerald-800">
                Loading Shop Dashboard...
              </p>
              <button
                onClick={() => setLoginSuccess(false)}
                className="text-xs font-bold text-emerald-700 underline mt-2"
              >
                Back to login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
              {/* SHOP ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  SHOP ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    placeholder="SHOP_XXXXXXXX"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 outline-none text-sm font-semibold tracking-wide uppercase transition-all"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 outline-none text-sm font-medium transition-all"
                />
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F0245C] hover:bg-[#D81B4E] text-white font-extrabold py-3.5 rounded-full shadow-lg shadow-[#F0245C]/30 flex items-center justify-center gap-2 cursor-pointer mt-2 transition-all"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          )}

          {/* Reset Link */}
          <div className="pt-2 border-t border-stone-100 text-xs text-stone-600">
            Forgot your password or setting up for the first time?{' '}
            <Link to="/contact" className="font-bold text-[#F0245C] hover:underline">
              Reset / Set Password Here
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <Link to="/" className="text-xs font-bold text-stone-500 hover:text-stone-800">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  )
}
