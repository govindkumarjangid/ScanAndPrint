import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  printerBrandOptions,
} from '../assets/assets'
import { useAuthStore } from '../store/useAuthStore'

export default function ShopAuth() {
  const location = useLocation()
  const navigate = useNavigate()

  // Zustand Store Hooks
  const {
    activeTab,
    registerStep,
    loginEmail,
    loginPassword,
    rememberMe,
    registerData,
    setActiveTab,
    nextRegisterStep,
    prevRegisterStep,
    setLoginEmail,
    setLoginPassword,
    setRememberMe,
    updateRegisterData,
    resetRegisterForm,
  } = useAuthStore()

  // Local UI States
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authSuccessMsg, setAuthSuccessMsg] = useState('')

  // Sync route path with Zustand activeTab on load / URL change
  useEffect(() => {
    if (location.pathname === '/register' || location.pathname === '/register-shop') {
      setActiveTab('register')
    } else if (location.pathname === '/shop-login' || location.pathname === '/login') {
      setActiveTab('login')
    }
  }, [location.pathname, setActiveTab])

  // Handle Tab Switch & Sync Browser URL smoothly
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setAuthSuccessMsg('')
    if (tab === 'login') {
      navigate('/shop-login', { replace: true })
    } else {
      navigate('/register', { replace: true })
    }
  }

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setAuthSuccessMsg('Login successful! Redirecting to Shop Dashboard...')
    }, 700)
  }

  // Handle Step 1 Next
  const handleStep1Next = (e) => {
    e.preventDefault()
    nextRegisterStep()
  }

  // Handle Step 2 Next
  const handleStep2Next = (e) => {
    e.preventDefault()
    nextRegisterStep()
  }

  // Handle Register Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setAuthSuccessMsg('Registration successful! Welcome to QR PrintPe.')
      setTimeout(() => {
        resetRegisterForm()
        handleTabSwitch('login')
      }, 1200)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-stone-100 flex flex-col justify-between py-10 px-4 sm:px-6 font-sans">
      
      {/* Top Branding Section */}
      <div className="flex flex-col items-center text-center gap-2 max-w-md mx-auto w-full">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="w-13 h-13 rounded-full border-2 border-brand bg-white flex items-center justify-center p-2 shadow-md shadow-rose-900/10"
        >
          <QrCode className="w-7 h-7 text-brand stroke-[2.2]" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
          QR PrintPe
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm font-medium">
          Automated Cyber Café Printing Network
        </p>
      </div>

      {/* Main Glassy Auth Card with Framer Motion `layout` for Smooth Zero-Shift Height Transitions */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-[460px] mx-auto bg-white/85 backdrop-blur-xl border border-rose-200/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-900/10 flex flex-col gap-6 my-6 overflow-hidden"
      >
        {/* Top Pill Tab Switcher with Sliding Active Highlight */}
        <div className="bg-stone-200/60 p-1.5 rounded-full grid grid-cols-2 gap-1 font-bold text-sm relative">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`relative py-2.5 px-4 rounded-full text-center transition-colors duration-200 cursor-pointer z-10 ${
              activeTab === 'login' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-full shadow-md shadow-rose-500/20 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`relative py-2.5 px-4 rounded-full text-center transition-colors duration-200 cursor-pointer z-10 ${
              activeTab === 'register' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-full shadow-md shadow-rose-500/20 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>Register Shop</span>
          </button>
        </div>

        {/* Auth Success Banner */}
        <AnimatePresence>
          {authSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{authSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB CONTENT WITH ANIMATE PRESENCE MODE WAIT */}
        <AnimatePresence mode="wait">
          {/* TAB 1: SIGN IN (LOGIN) */}
          {activeTab === 'login' && (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLoginSubmit}
              className="flex flex-col gap-4 text-left"
            >
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-700">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-4 pr-12 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand accent-brand"
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/contact" className="text-brand font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand hover:bg-brand-hover text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2 text-base transition-all"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </motion.button>

              {/* Divider */}
              <div className="border-t border-stone-200/80 pt-4 text-center text-xs text-stone-600 font-medium">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className="text-brand font-extrabold hover:underline cursor-pointer"
                >
                  Register your shop
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 2: SHOP REGISTER KAREIN (3 STEPS FORM) */}
          {activeTab === 'register' && (
            <motion.div
              key="register-form-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5 text-left"
            >
              {/* 3-Step Progress Bar Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                  <span className="text-brand">
                    {registerStep === 1 && 'Step 1 · Personal Details'}
                    {registerStep === 2 && 'Step 2 · Shop Details'}
                    {registerStep === 3 && 'Step 3 · Printer & Pricing Setup'}
                  </span>
                  <span className="text-stone-400 font-semibold">Step {registerStep} of 3</span>
                </div>

                {/* Progress Fill Bar */}
                <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '33%' }}
                    animate={{
                      width:
                        registerStep === 1 ? '33%' : registerStep === 2 ? '66%' : '100%',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
              </div>

              {/* STEP 1: PERSONAL DETAILS */}
              {registerStep === 1 && (
                <form onSubmit={handleStep1Next} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.fullName}
                      onChange={(e) => updateRegisterData({ fullName: e.target.value })}
                      placeholder="Rahul Kumar"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Mobile Number with +91 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Mobile Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 px-3.5 rounded-2xl border border-stone-300/80 bg-stone-100/70 text-stone-700 font-bold text-xs flex items-center justify-center">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        value={registerData.mobile}
                        onChange={(e) => updateRegisterData({ mobile: e.target.value })}
                        placeholder="98765 43210"
                        className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => updateRegisterData({ email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={registerData.password}
                        onChange={(e) => updateRegisterData({ password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-11 pl-4 pr-12 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={registerData.confirmPassword}
                        onChange={(e) => updateRegisterData({ confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-11 pl-4 pr-12 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Next Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2 text-base transition-all"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>
              )}

              {/* STEP 2: SHOP DETAILS */}
              {registerStep === 2 && (
                <form onSubmit={handleStep2Next} className="flex flex-col gap-4">
                  {/* Shop Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.shopName}
                      onChange={(e) => updateRegisterData({ shopName: e.target.value })}
                      placeholder="Sharma Cyber Cafe & Prints"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Shop Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Shop Address</label>
                    <input
                      type="text"
                      required
                      value={registerData.shopAddress}
                      onChange={(e) => updateRegisterData({ shopAddress: e.target.value })}
                      placeholder="Main Market, Opposite Railway Station"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={registerData.pincode}
                      onChange={(e) => updateRegisterData({ pincode: e.target.value })}
                      placeholder="110001"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* City & State */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">City & State</label>
                    <input
                      type="text"
                      required
                      value={registerData.cityState}
                      onChange={(e) => updateRegisterData({ cityState: e.target.value })}
                      placeholder="New Delhi, Delhi"
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Action Buttons: Back & Next */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="py-3 px-4 rounded-2xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-brand hover:bg-brand-hover text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer text-sm transition-all"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PRINTER SETUP & PRINT PRICING RATES */}
              {registerStep === 3 && (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                  {/* Printer Brand */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Primary Printer Brand</label>
                    <select
                      value={registerData.printerBrand}
                      onChange={(e) => updateRegisterData({ printerBrand: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium cursor-pointer transition-all"
                    >
                      {printerBrandOptions.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Print Machine Output Types */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-700">Print Output Capabilities</label>
                    <select
                      value={registerData.printType}
                      onChange={(e) => updateRegisterData({ printType: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl border border-stone-300/80 bg-stone-50/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium cursor-pointer transition-all"
                    >
                      <option value="Both">Both Black & White + Color Printers</option>
                      <option value="BW">Black & White Only</option>
                      <option value="Color">Color Printer Only</option>
                    </select>
                  </div>

                  {/* PRINT PRICING RATES (B&W vs COLOR) */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* B&W Rate */}
                    <div className="flex flex-col gap-1.5 bg-stone-100/70 p-3 rounded-2xl border border-stone-200">
                      <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                        <span>B&W Rate</span>
                        <span className="text-[10px] text-stone-500">₹ / page</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-stone-500 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={registerData.bwRate}
                          onChange={(e) => updateRegisterData({ bwRate: Number(e.target.value) })}
                          className="w-full h-10 pl-7 pr-3 rounded-xl border border-stone-300 bg-white focus:border-brand outline-none text-sm font-extrabold text-stone-900"
                        />
                      </div>
                    </div>

                    {/* Color Rate */}
                    <div className="flex flex-col gap-1.5 bg-rose-50/60 p-3 rounded-2xl border border-rose-200/80">
                      <label className="text-xs font-bold text-brand flex items-center justify-between">
                        <span>Color Rate</span>
                        <span className="text-[10px] text-rose-500 font-semibold">₹ / page</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-brand font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={registerData.colorRate}
                          onChange={(e) => updateRegisterData({ colorRate: Number(e.target.value) })}
                          className="w-full h-10 pl-7 pr-3 rounded-xl border border-rose-300 bg-white focus:border-brand outline-none text-sm font-extrabold text-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hardware Checkbox */}
                  <div className="bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-2xl">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-800 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={registerData.hardwareReady}
                        onChange={(e) => updateRegisterData({ hardwareReady: e.target.checked })}
                        className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand accent-brand mt-0.5"
                      />
                      <span>I have a Windows PC & Printer connected and ready for setup.</span>
                    </label>
                  </div>

                  {/* Action Buttons: Back & Complete */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="py-3 px-4 rounded-2xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-brand hover:bg-brand-hover text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer text-sm transition-all"
                    >
                      <span>{isSubmitting ? 'Registering...' : 'Complete Registration ✨'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Switch Link */}
              <div className="border-t border-stone-200/80 pt-4 text-center text-xs text-stone-600 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className="text-brand font-extrabold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Links */}
      <div className="text-center text-xs font-semibold text-stone-500 flex items-center justify-center gap-4">
        <Link to="/disclaimer" className="hover:text-stone-800 transition-colors">
          Terms
        </Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-stone-800 transition-colors">
          FAQ
        </Link>
      </div>

    </div>
  )
}
