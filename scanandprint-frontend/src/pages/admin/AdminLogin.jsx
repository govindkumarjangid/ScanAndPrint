import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Zap,
  KeyRound,
  ArrowLeft,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { adminLogin } = useAdminStore()

  const handleLogin = async (e) => {
    e.preventDefault()

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()

    if (!cleanEmail) {
      toast.error('Please enter your Admin Email address')
      return
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error('Please enter a valid email format (e.g. admin@scanandprint.in)')
      return
    }
    if (!cleanPassword) {
      toast.error('Please enter your Security Key / Password')
      return
    }

    setIsLoading(true)

    try {
      await adminLogin(cleanEmail, cleanPassword)
      toast.success('Access Authorized. Welcome Super Admin!')
      setTimeout(() => navigate('/admin/dashboard'), 600)
    } catch (err) {
      // Toast notification is already handled in adminLogin store
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden font-sans select-none">
      
      {/* Decorative Ambient Background Security Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-500/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-rose-900/15 rounded-full blur-[120px]" />
      </div>

      {/* Top Branding Section */}
      <div className="relative z-10 flex flex-col items-center text-center gap-2 max-w-md mx-auto w-full pt-4">
        
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-900/70 text-xs font-extrabold mb-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="tracking-wider uppercase text-[10px]">Restricted Super Admin Gateway</span>
        </div>

        <Link to="/" className="inline-flex flex-col items-center group cursor-pointer">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-rose-900/20 border border-stone-700/60 transition-all duration-300 relative overflow-hidden"
            >
              <img src="/svgs/logo.svg" alt="Scan&Print Logo" className="w-full h-full object-contain" />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xl shadow-rose-500/25 border border-rose-400/40 transition-all duration-300"
            >
              <ShieldCheck className="w-7 h-7" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mt-3.5 text-white font-heading">
            Super <span className="text-brand">Admin</span>
          </h1>
        </Link>

        <p className="text-stone-400 text-xs sm:text-sm font-medium mt-0.5">
          Authenticate to enter the platform control & verification console
        </p>
      </div>

      {/* Main Glassy Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md mx-auto bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-stone-950 flex flex-col gap-6 my-6 overflow-hidden"
      >
        {/* Glowing Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-brand to-transparent opacity-80" />

        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4 text-left">
          
          {/* Admin Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Admin Email ID
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-stone-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@scanandprint.in"
                className="w-full h-12 pl-10 pr-4 rounded-2xl border border-stone-800 bg-stone-950/80 focus:bg-stone-950 focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium text-stone-100 transition-all placeholder:text-stone-600"
              />
            </div>
          </div>

          {/* Admin Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Security Key / Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-stone-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 pl-10 pr-11 rounded-2xl border border-stone-800 bg-stone-950/80 focus:bg-stone-950 focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium text-stone-100 transition-all placeholder:text-stone-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 text-sm font-bold mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Console Access...</span>
              </>
            ) : (
              <>
                <span>Authorize & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Trust Security Pills */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-800/80 text-center">
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-stone-400">256-Bit SSL</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-stone-400">JWT Token</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <Zap className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold text-stone-400">Direct Sync</span>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Footer Navigation */}
      <div className="relative z-10 flex items-center justify-center gap-6 text-xs font-semibold text-stone-400">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span>·</span>
        <Link to="/shop-login" className="hover:text-brand transition-colors">
          Shop Owner Portal
        </Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-white transition-colors">
          Security Support
        </Link>
      </div>

    </div>
  )
}
