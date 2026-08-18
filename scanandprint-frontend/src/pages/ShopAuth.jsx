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
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  X,
  AlertTriangle,
  RefreshCw,
  Check,
} from '../assets/assets'
import { useAuthStore } from '../store/useAuthStore'
import { loadRazorpayScript } from '../lib/razorpay'
import toast from 'react-hot-toast'

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
    publicSettings,
    fetchPublicSettings,
    setActiveTab,
    nextRegisterStep,
    prevRegisterStep,
    setLoginEmail,
    setLoginPassword,
    setRememberMe,
    updateRegisterData,
    resetRegisterForm,
    registerInit,
    verifySubscriptionPayment,
  } = useAuthStore()

  // Local UI States
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY_399')
  const [showFailedModal, setShowFailedModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [lastOrderDetails, setLastOrderDetails] = useState(null)

  useEffect(() => {
    fetchPublicSettings()
  }, [fetchPublicSettings])

  const monthlyPrice = publicSettings?.monthlyPrice || 399
  const lifetimePrice = publicSettings?.lifetimePrice || 599
  const isDemoAvailable = publicSettings?.demoMode ?? true

  // Sync route path and plan query param with Zustand activeTab on load / URL change
  useEffect(() => {
    if (location.pathname === '/register' || location.pathname === '/register-shop') {
      setActiveTab('register')
    } else if (location.pathname === '/shop-login' || location.pathname === '/login') {
      setActiveTab('login')
    }

    const params = new URLSearchParams(location.search)
    const planParam = params.get('plan')
    if (planParam === 'lifetime') {
      setSelectedPlan('LIFETIME_599')
      updateRegisterData({ planType: 'LIFETIME_599' })
    } else if (planParam === 'monthly') {
      setSelectedPlan('MONTHLY_399')
      updateRegisterData({ planType: 'MONTHLY_399' })
    } else if (planParam === 'demo') {
      setSelectedPlan('FREE_TRIAL')
      updateRegisterData({ planType: 'FREE_TRIAL' })
    }
  }, [location.pathname, location.search, setActiveTab, updateRegisterData])

  // Handle Tab Switch & Sync Browser URL smoothly
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    if (tab === 'login') {
      navigate('/shop-login', { replace: true })
    } else {
      navigate('/register', { replace: true })
    }
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loginPromise = async () => {
      const { login } = useAuthStore.getState()
      await login(loginEmail, loginPassword)
      setTimeout(() => navigate('/owner/dashboard'), 1000)
    }

    toast.promise(loginPromise(), {
      loading: 'Signing in...',
      success: 'Login successful! Redirecting to Shop Dashboard...',
      error: (err) => err.message || 'Login failed'
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  // Handle Step 1 Next
  const handleStep1Next = (e) => {
    e.preventDefault()
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    nextRegisterStep()
  }

  // Handle Step 2 Next
  const handleStep2Next = (e) => {
    e.preventDefault()
    nextRegisterStep()
  }

  // Handle Step 3 Next (Advances to Step 4: Plan Selection)
  const handleStep3Next = (e) => {
    e.preventDefault()
    if (Number(registerData.bwRate) <= 0 || Number(registerData.colorRate) <= 0) {
      toast.error("Please enter valid positive print rates")
      return
    }
    nextRegisterStep()
  }

  // Trigger Razorpay Payment & Activation Flow
  const triggerRazorpayCheckout = async (planTypeToUse) => {
    const targetPlan = planTypeToUse || selectedPlan || 'MONTHLY_399'

    try {
      setIsSubmitting(true)

      // 1. If 2-Hour Demo Free Trial is selected
      if (targetPlan === 'FREE_TRIAL') {
        const orderData = await registerInit({
          fullName: registerData.fullName,
          mobile: registerData.mobile,
          email: registerData.email,
          password: registerData.password,
          shopName: registerData.shopName,
          shopAddress: registerData.shopAddress,
          pincode: registerData.pincode,
          cityState: registerData.cityState,
          printerBrand: registerData.printerBrand,
          bwRate: registerData.bwRate,
          colorRate: registerData.colorRate,
          planType: 'FREE_TRIAL',
        })

        setShowSuccessModal(true)
        toast.success('🎉 2-Hour Free Demo Activated!')
        setTimeout(() => navigate('/owner/dashboard'), 1500)
        return
      }

      // 2. Load Razorpay Checkout SDK
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.')
        setIsSubmitting(false)
        return
      }

      // 3. Create Pending Shop Account & Razorpay Order on Backend
      const orderData = await registerInit({
        fullName: registerData.fullName,
        mobile: registerData.mobile,
        email: registerData.email,
        password: registerData.password,
        shopName: registerData.shopName,
        shopAddress: registerData.shopAddress,
        pincode: registerData.pincode,
        cityState: registerData.cityState,
        printerBrand: registerData.printerBrand,
        bwRate: registerData.bwRate,
        colorRate: registerData.colorRate,
        planType: targetPlan,
      })

      setLastOrderDetails(orderData)

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'QR PrintPe',
        description: `${orderData.planType === 'LIFETIME_599' ? 'Lifetime' : 'Monthly'} Subscription Plan`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.ownerName || registerData.fullName,
          email: orderData.email || registerData.email,
          contact: orderData.phone || registerData.mobile,
        },
        theme: {
          color: '#F0245C',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false)
            setPaymentError('Payment window was closed before completion. Your shop is not activated yet. Please complete payment to unlock your dashboard.')
            setShowFailedModal(true)
          },
        },
        handler: async (response) => {
          try {
            setIsVerifying(true)
            await verifySubscriptionPayment({
              shopId: orderData.shopId,
              planType: orderData.planType,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setShowSuccessModal(true)
            toast.success('🎉 Payment Verified! Welcome to QR PrintPe.')
            setTimeout(() => navigate('/owner/dashboard'), 1800)
          } catch (vErr) {
            setPaymentError(vErr.message || 'Payment signature verification failed. Please contact support.')
            setShowFailedModal(true)
          } finally {
            setIsVerifying(false)
            setIsSubmitting(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (failResponse) => {
        setIsSubmitting(false)
        setPaymentError(failResponse.error?.description || 'Payment transaction failed. Please try again or use another payment method.')
        setShowFailedModal(true)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Failed to initialize payment')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50/70 via-pink-50/40 to-stone-100 flex flex-col justify-between py-10 px-4 sm:px-6 font-sans">

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
        className="w-full max-w-115 mx-auto bg-white/85 backdrop-blur-xl border border-rose-200/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-900/10 flex flex-col gap-6 my-6 overflow-hidden"
      >
        {/* Top Pill Tab Switcher with Sliding Active Highlight */}
        <div className="bg-stone-200/60 p-1.5 rounded-2xl grid grid-cols-2 gap-1 font-bold text-sm relative">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`relative py-2.5 px-4 rounded-2xl text-center transition-colors duration-200 cursor-pointer z-10 ${
              activeTab === 'login' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-2xl shadow-md shadow-rose-500/20 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`relative py-2.5 px-4 rounded-2xl text-center transition-colors duration-200 cursor-pointer z-10 ${
              activeTab === 'register' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-2xl shadow-md shadow-rose-500/20 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>Register Shop</span>
          </button>
        </div>

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

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
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
              {/* 4-Step Progress Bar Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                  <span className="text-brand">
                    {registerStep === 1 && 'Step 1 · Personal Details'}
                    {registerStep === 2 && 'Step 2 · Shop Details'}
                    {registerStep === 3 && 'Step 3 · Rates & Setup'}
                    {registerStep === 4 && 'Step 4 · Plan & Payment'}
                  </span>
                  <span className="text-stone-400 font-semibold">Step {registerStep} of 4</span>
                </div>

                {/* Progress Fill Bar */}
                <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '25%' }}
                    animate={{
                      width:
                        registerStep === 1
                          ? '25%'
                          : registerStep === 2
                          ? '50%'
                          : registerStep === 3
                          ? '75%'
                          : '100%',
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

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn btn-primary w-full mt-2"
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

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="btn btn-outline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PRINTER SETUP & PRINT PRICING RATES */}
              {registerStep === 3 && (
                <form onSubmit={handleStep3Next} className="flex flex-col gap-4">
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

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="btn btn-outline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <span>Choose Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUBSCRIPTION PLAN SELECTION & RAZORPAY PAYMENT */}
              {registerStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900">Select Subscription Plan</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Activate full Owner Dashboard & instant Windows printing</p>
                  </div>

                  {/* Plan Cards Grid */}
                  <div className="flex flex-col gap-3">
                    {/* Monthly Plan */}
                    <div
                      onClick={() => {
                        setSelectedPlan('MONTHLY_399')
                        updateRegisterData({ planType: 'MONTHLY_399' })
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        selectedPlan === 'MONTHLY_399'
                          ? 'border-brand bg-rose-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === 'MONTHLY_399' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                        }`}>
                          {selectedPlan === 'MONTHLY_399' && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-stone-900">Monthly Plan</span>
                            <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">Renews monthly</span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5">Full owner dashboard, live kiosk & print agent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-stone-900">₹{monthlyPrice}</div>
                        <div className="text-[10px] text-stone-500 font-semibold">/ 30 days</div>
                      </div>
                    </div>

                    {/* Lifetime Plan */}
                    <div
                      onClick={() => {
                        setSelectedPlan('LIFETIME_599')
                        updateRegisterData({ planType: 'LIFETIME_599' })
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                        selectedPlan === 'LIFETIME_599'
                          ? 'border-brand bg-rose-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-brand text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                        Best Value
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === 'LIFETIME_599' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                        }`}>
                          {selectedPlan === 'LIFETIME_599' && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-stone-900">Lifetime Access</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5">Pay once, permanent access forever</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-stone-900">₹{lifetimePrice}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">One-time</div>
                      </div>
                    </div>

                    {/* Free Trial Demo (if enabled) */}
                    {isDemoAvailable && (
                      <div
                        onClick={() => {
                          setSelectedPlan('FREE_TRIAL')
                          updateRegisterData({ planType: 'FREE_TRIAL' })
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          selectedPlan === 'FREE_TRIAL'
                            ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === 'FREE_TRIAL' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-300'
                          }`}>
                            {selectedPlan === 'FREE_TRIAL' && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-stone-900">2-Hour Free Demo</span>
                              <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Free Trial</span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Test full live workflow for 2 hours</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-extrabold text-stone-900">₹0</div>
                          <div className="text-[10px] text-stone-500 font-semibold">2 Hours</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-100/70 p-2.5 rounded-xl border border-stone-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Secured by 256-bit encrypted Razorpay Payment Gateway.</span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      disabled={isSubmitting || isVerifying}
                      className="btn btn-outline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerRazorpayCheckout(selectedPlan)}
                      disabled={isSubmitting || isVerifying}
                      className="btn btn-primary"
                    >
                      {isSubmitting || isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isVerifying ? 'Verifying...' : 'Processing...'}</span>
                        </>
                      ) : selectedPlan === 'FREE_TRIAL' ? (
                        <span>Activate Trial ✨</span>
                      ) : (
                        <span>Pay ₹{selectedPlan === 'LIFETIME_599' ? lifetimePrice : monthlyPrice} & Activate 💳</span>
                      )}
                    </button>
                  </div>
                </div>
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

      {/* PAYMENT FAILED / CANCELLED MODAL */}
      {showFailedModal && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-rose-200 flex flex-col gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 font-heading">Payment Incomplete</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {paymentError || 'Your payment was not completed. Shop Owner Dashboard access is locked until subscription payment is verified.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowFailedModal(false)
                  triggerRazorpayCheckout(selectedPlan)
                }}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment (₹{selectedPlan === 'LIFETIME_599' ? lifetimePrice : monthlyPrice})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFailedModal(false)}
                className="btn btn-ghost text-xs text-stone-500 hover:text-stone-800"
              >
                Change Plan / Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PAYMENT SUCCESS CELEBRATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-emerald-200 flex flex-col gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Subscription Active
              </span>
              <h3 className="text-xl font-extrabold text-stone-900 font-heading mt-2">Welcome to QR PrintPe!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Your shop subscription is verified and active. Redirecting to your Owner Dashboard...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-brand text-xs font-bold pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Launching Dashboard...</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer Links */}
      <div className="text-center text-xs font-semibold text-stone-500 flex items-center justify-center gap-4">
        <Link to="/terms-and-conditions" className="hover:text-stone-800 transition-colors">
          Terms
        </Link>
        <span>·</span>
        <Link to="/privacy-policy" className="hover:text-stone-800 transition-colors">
          Privacy
        </Link>
        <span>·</span>
        <Link to="/refund-policy" className="hover:text-stone-800 transition-colors">
          Refund Policy
        </Link>
        <span>·</span>
        <Link to="/disclaimer" className="hover:text-stone-800 transition-colors">
          Disclaimer
        </Link>
      </div>

    </div>
  )
}
