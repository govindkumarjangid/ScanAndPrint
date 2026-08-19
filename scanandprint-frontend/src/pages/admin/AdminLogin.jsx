import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { adminLogin } = useAdminStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await adminLogin(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      // toast is handled in adminLogin
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Header */}
        <Link to="/" className="flex flex-col items-center mb-8 group cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white/95 rounded-2xl p-2.5 flex items-center justify-center shadow-[0_0_30px_rgba(240,36,92,0.25)] border border-stone-700/60 group-hover:scale-105 transition-transform duration-300">
              <img src="/svgs/logo.svg" alt="Scan&Print Logo" className="w-full h-full object-contain" />
            </div>
            <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(240,36,92,0.25)] relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 font-heading">
            Super Admin
          </h1>
          <p className="text-stone-400 font-medium text-sm text-center">
            Sign in to access the Scan&Print management console
          </p>
        </Link>

        {/* Login Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-stone-800 via-brand to-stone-800 opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all font-medium placeholder:text-stone-600"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all font-medium placeholder:text-stone-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Access Dashboard</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
