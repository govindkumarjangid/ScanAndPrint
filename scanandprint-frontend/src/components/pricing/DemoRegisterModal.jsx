import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  Smartphone,
  Lock,
  Store,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function DemoRegisterModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { demoRegister, isLoading } = useAuthStore()

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!mobile || mobile.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await demoRegister({
        mobile: mobile.trim(),
        password,
        shopName: shopName.trim() || 'Demo Cyber Cafe & Prints',
      })
      onClose()
      navigate('/owner/dashboard')
    } catch (err) {
      console.warn('Demo registration note:', err.message)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200"
        >
          {/* Header Banner */}
          <div className="bg-linear-to-r from-rose-600 to-brand p-6 text-white relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold w-max mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Instant 2-Hour Trial</span>
            </div>

            <h3 className="text-xl font-extrabold font-heading">
              Start Free 2-Hour Demo 🚀
            </h3>
            <p className="text-xs text-rose-100 font-medium mt-1 leading-relaxed">
              Experience the full Shop Owner Dashboard, Desktop Print Agent, and live Kiosk instantly.
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">
                Mobile Number <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">
                Create Password <span className="text-brand">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
                />
              </div>
            </div>

            {/* Shop Name (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">
                Shop Name <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Verma Cyber Cafe"
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Trial Terms Notice */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You will have full owner access for <strong>2 hours</strong>. No credit card or upfront payment needed.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary py-3.5 w-full shadow-lg flex items-center justify-center gap-2 text-sm font-bold mt-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Demo...</span>
                </>
              ) : (
                <>
                  <span>Enter Owner Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
