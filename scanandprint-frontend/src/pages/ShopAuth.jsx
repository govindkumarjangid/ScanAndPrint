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
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  Store,
  Printer,
  FileText,
  HelpCircle,
  Smartphone,
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
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY_299')
  const [showFailedModal, setShowFailedModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [lastOrderDetails, setLastOrderDetails] = useState(null)

  useEffect(() => {
    fetchPublicSettings()
  }, [fetchPublicSettings])

  const monthlyPrice = publicSettings?.monthlyPrice || 299
  const monthlyOriginalPrice = publicSettings?.monthlyOriginalPrice || 499
  const yearlyPrice = publicSettings?.yearlyPrice || 799
  const yearlyOriginalPrice = publicSettings?.yearlyOriginalPrice || 3588
  const demoDurationHours = publicSettings?.demoDurationHours || 2
  const isDemoAvailable = publicSettings?.demoMode ?? true

  const monthlyDiscountPercent = monthlyOriginalPrice > monthlyPrice
    ? Math.round(((monthlyOriginalPrice - monthlyPrice) / monthlyOriginalPrice) * 100)
    : 0

  const yearlyDiscountPercent = yearlyOriginalPrice > yearlyPrice
    ? Math.round(((yearlyOriginalPrice - yearlyPrice) / yearlyOriginalPrice) * 100)
    : Math.max(0, Math.round((((monthlyPrice * 12) - yearlyPrice) / (monthlyPrice * 12)) * 100))

  // Sync route path and plan query param with Zustand activeTab on load / URL change
  useEffect(() => {
    if (location.pathname === '/register' || location.pathname === '/register-shop') {
      setActiveTab('register')
    } else if (location.pathname === '/shop-login' || location.pathname === '/login') {
      setActiveTab('login')
    }

    const params = new URLSearchParams(location.search)
    const planParam = params.get('plan')
    if (planParam === 'yearly') {
      setSelectedPlan('YEARLY_799')
      updateRegisterData({ planType: 'YEARLY_799' })
    } else if (planParam === 'monthly') {
      setSelectedPlan('MONTHLY_299')
      updateRegisterData({ planType: 'MONTHLY_299' })
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
    const cleanEmail = loginEmail.trim()
    const cleanPassword = loginPassword.trim()

    if (!cleanEmail) {
      toast.error('Please enter your registered email address')
      return
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error('Please enter a valid email format')
      return
    }
    if (!cleanPassword) {
      toast.error('Please enter your password')
      return
    }

    setIsSubmitting(true)
    const loginPromise = async () => {
      const { login } = useAuthStore.getState()
      await login(cleanEmail, cleanPassword)
      setTimeout(() => navigate('/owner/dashboard'), 1000)
    }

    toast.promise(loginPromise(), {
      loading: 'Verifying credentials...',
      success: 'Welcome back! Redirecting to Shop Dashboard...',
      error: (err) => err.message || 'Login failed. Please check email and password.'
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  // Handle Step 1 Next
  const handleStep1Next = (e) => {
    e.preventDefault()
    const cleanName = registerData.fullName?.trim()
    const cleanMobile = registerData.mobile?.trim()
    const cleanEmail = registerData.email?.trim()
    const cleanPassword = registerData.password
    const cleanConfirm = registerData.confirmPassword

    if (!cleanName) {
      toast.error('Please enter owner full name')
      return
    }
    if (!cleanMobile) {
      toast.error('Please enter mobile number')
      return
    }
    if (cleanMobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits')
      return
    }
    if (!cleanEmail) {
      toast.error('Please enter email address')
      return
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!cleanPassword) {
      toast.error('Please enter a password')
      return
    }
    if (cleanPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (cleanPassword !== cleanConfirm) {
      toast.error('Passwords do not match!')
      return
    }
    nextRegisterStep()
  }

  // Handle Step 2 Next
  const handleStep2Next = (e) => {
    e.preventDefault()
    if (!registerData.shopName?.trim()) {
      toast.error('Please enter shop name')
      return
    }
    if (!registerData.shopAddress?.trim()) {
      toast.error('Please enter shop address or landmark')
      return
    }
    if (!registerData.pincode?.trim()) {
      toast.error('Please enter 6-digit area pincode')
      return
    }
    if (registerData.pincode.trim().length !== 6) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }
    if (!registerData.cityState?.trim()) {
      toast.error('Please enter city and state')
      return
    }
    nextRegisterStep()
  }

  // Handle Step 3 Next (Advances to Step 4: Plan Selection)
  const handleStep3Next = (e) => {
    e.preventDefault()
    if (!registerData.bwRate || Number(registerData.bwRate) <= 0) {
      toast.error('Please enter a valid positive B&W rate (min ₹0.5)')
      return
    }
    if (!registerData.colorRate || Number(registerData.colorRate) <= 0) {
      toast.error('Please enter a valid positive Color rate (min ₹1.0)')
      return
    }
    nextRegisterStep()
  }

  // Trigger Razorpay Payment & Activation Flow
  const triggerRazorpayCheckout = async (planTypeToUse) => {
    const targetPlan = planTypeToUse || selectedPlan || 'MONTHLY_299'

    try {
      setIsSubmitting(true)

      // 1. If 2-Hour Demo Free Trial is selected (Instant Zero-Payment Access)
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
        name: 'Scan&Print',
        description: `${orderData.planType === 'YEARLY_799' ? 'Yearly' : 'Monthly'} Subscription Plan`,
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
            toast.success('🎉 Payment Verified! Welcome to Scan&Print.')
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
    <div className="min-h-screen bg-stone-50 relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-6 font-sans">

      {/* Decorative Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-150 h-150 bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -left-40 w-96 h-96 bg-rose-400/8 rounded-full blur-[100px]" />
      </div>

      {/* Top Branding Section */}
      <div className="relative z-10 flex flex-col items-center text-center gap-2 max-w-md mx-auto w-full pt-2 sm:pt-4">
        <Link to="/" className="inline-flex flex-col items-center group cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 2 }}
            whileTap={{ scale: 0.96 }}
            className="w-16 h-16 rounded-2xl bg-white border border-rose-200/90 p-2.5 shadow-xl shadow-rose-900/10 flex items-center justify-center relative overflow-hidden group-hover:border-brand/60 group-hover:shadow-rose-500/20 transition-all duration-300"
          >
            <img src="/svgs/logo.svg" alt="Scan&Print Logo" className="w-full h-full object-contain" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-stone-900 font-heading">
            Scan<span className="text-brand">&Print</span>
          </h1>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-brand border border-rose-200/70 text-xs font-extrabold mt-1">
          <Store className="w-3.5 h-3.5" />
          <span>Shop Owner Portal</span>
        </div>

        <p className="text-stone-500 text-xs sm:text-sm font-medium">
          {activeTab === 'login'
            ? 'Sign in to manage your automated print counter and jobs'
            : 'Register your shop & start automated customer printing'}
        </p>
      </div>

      {/* Main Glassy Auth Card */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative z-10 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl sm:rounded-3xl p-4.5 sm:p-8 shadow-2xl shadow-stone-900/8 flex flex-col gap-5 sm:gap-6 my-4 sm:my-6 overflow-hidden"
      >
        {/* Top Pill Tab Switcher */}
        <div className="bg-stone-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl grid grid-cols-2 gap-1 font-bold text-xs sm:text-sm relative border border-stone-200/60 min-w-0">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`relative py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl text-center transition-colors duration-200 cursor-pointer z-10 flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
              activeTab === 'login' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-lg sm:rounded-xl shadow-md shadow-rose-500/25 z-[-1]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('register')}
            className={`relative py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl text-center transition-colors duration-200 cursor-pointer z-10 flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
              activeTab === 'register' ? 'text-white font-extrabold' : 'text-stone-600 hover:text-stone-900 font-semibold'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-brand rounded-lg sm:rounded-xl shadow-md shadow-rose-500/25 z-[-1]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Register Shop</span>
          </button>
        </div>

        {/* TAB CONTENT WITH ANIMATE PRESENCE */}
        <AnimatePresence mode="wait">
          {/* TAB 1: SIGN IN (LOGIN) */}
          {activeTab === 'login' && (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLoginSubmit}
              noValidate
              className="flex flex-col gap-4 text-left"
            >
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Registered Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="shop@example.com"
                    className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand focus:ring-3 focus:ring-rose-500/15 outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] sm:text-xs text-brand font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 sm:h-12 pl-10 pr-11 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand focus:ring-3 focus:ring-rose-500/15 outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold mt-1 sm:mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in to Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-stone-100 text-center">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-stone-700">0-Click Print</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-stone-700">256-Bit SSL</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-stone-700">QR Kiosk</span>
                </div>
              </div>

              {/* Switch to Register */}
              <div className="text-center text-xs text-stone-600 font-medium pt-1">
                Don't have a shop account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className="text-brand font-extrabold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  Register Shop (2-Min Setup)
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 2: SHOP REGISTER (4 STEPS WIZARD) */}
          {activeTab === 'register' && (
            <motion.div
              key="register-form-container"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 sm:gap-5 text-left"
            >
              {/* 4-Step Progress Header */}
              <div className="flex flex-col gap-2 bg-stone-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-200/70">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                  <span className="text-brand flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-mono shrink-0">
                      {registerStep}
                    </span>
                    <span className="truncate">
                      {registerStep === 1 && 'Personal Info'}
                      {registerStep === 2 && 'Shop Location'}
                      {registerStep === 3 && 'Printer Rates'}
                      {registerStep === 4 && 'Subscription Plan'}
                    </span>
                  </span>
                  <span className="text-stone-400 font-semibold text-[10px] sm:text-[11px] shrink-0">Step {registerStep} of 4</span>
                </div>

                {/* Progress Fill Bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
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
                <form onSubmit={handleStep1Next} noValidate className="flex flex-col gap-3 sm:gap-3.5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Owner Full Name</label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                      <input
                        type="text"
                        required
                        value={registerData.fullName}
                        onChange={(e) => updateRegisterData({ fullName: e.target.value })}
                        placeholder="Rahul Sharma"
                        className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand focus:ring-3 focus:ring-rose-500/15 outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Mobile Number with +91 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Mobile Number</label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 sm:h-12 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <div className="relative flex items-center flex-1 min-w-0">
                        <Phone className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          value={registerData.mobile}
                          onChange={(e) => updateRegisterData({ mobile: e.target.value.replace(/\D/g, '') })}
                          placeholder="9876543210"
                          className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand focus:ring-3 focus:ring-rose-500/15 outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => updateRegisterData({ email: e.target.value })}
                        placeholder="sharma.prints@example.com"
                        className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand focus:ring-3 focus:ring-rose-500/15 outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Password</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none shrink-0" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={registerData.password}
                          onChange={(e) => updateRegisterData({ password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full h-11 sm:h-12 pl-9 pr-9 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Confirm</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none shrink-0" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={registerData.confirmPassword}
                          onChange={(e) => updateRegisterData({ confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full h-11 sm:h-12 pl-9 pr-9 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn btn-primary w-full mt-1 sm:mt-2 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md font-bold flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Proceed to Shop Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>
              )}

              {/* STEP 2: SHOP DETAILS */}
              {registerStep === 2 && (
                <form onSubmit={handleStep2Next} noValidate className="flex flex-col gap-3 sm:gap-3.5">
                  {/* Shop Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Shop Name</label>
                    <div className="relative flex items-center">
                      <Building2 className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                      <input
                        type="text"
                        required
                        value={registerData.shopName}
                        onChange={(e) => updateRegisterData({ shopName: e.target.value })}
                        placeholder="Sharma Cyber Cafe & Xerox"
                        className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Shop Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Shop Address / Landmark</label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                      <input
                        type="text"
                        required
                        value={registerData.shopAddress}
                        onChange={(e) => updateRegisterData({ shopAddress: e.target.value })}
                        placeholder="Shop No. 4, Opposite Railway Station"
                        className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Pincode & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        value={registerData.pincode}
                        onChange={(e) => updateRegisterData({ pincode: e.target.value.replace(/\D/g, '') })}
                        placeholder="110001"
                        className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">City & State</label>
                      <input
                        type="text"
                        required
                        value={registerData.cityState}
                        onChange={(e) => updateRegisterData({ cityState: e.target.value })}
                        placeholder="New Delhi, Delhi"
                        className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-1 sm:mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="btn btn-outline py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PRINTER SETUP & RATES */}
              {registerStep === 3 && (
                <form onSubmit={handleStep3Next} noValidate className="flex flex-col gap-3 sm:gap-3.5">
                  {/* Printer Brand */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider">Primary Printer Brand</label>
                    <div className="relative flex items-center">
                      <Printer className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none shrink-0" />
                      <select
                        value={registerData.printerBrand}
                        onChange={(e) => updateRegisterData({ printerBrand: e.target.value })}
                        className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl sm:rounded-2xl border border-stone-300 bg-stone-50/70 focus:bg-white focus:border-brand outline-none text-xs sm:text-sm font-medium text-stone-900 cursor-pointer transition-all appearance-none"
                      >
                        {printerBrandOptions.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Print Pricing Rates */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                    {/* B&W Rate */}
                    <div className="flex flex-col gap-1 bg-stone-100/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-200">
                      <label className="text-[11px] sm:text-xs font-bold text-stone-800 flex items-center justify-between">
                        <span>B&W Rate</span>
                        <span className="text-[9px] sm:text-[10px] text-stone-500 font-semibold">₹ / pg</span>
                      </label>
                      <div className="relative flex items-center mt-0.5 sm:mt-1">
                        <span className="absolute left-3 text-stone-500 font-bold text-xs sm:text-sm">₹</span>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          required
                          value={registerData.bwRate}
                          onChange={(e) => updateRegisterData({ bwRate: Number(e.target.value) })}
                          className="w-full h-9 sm:h-10 pl-6 sm:pl-7 pr-2.5 rounded-lg sm:rounded-xl border border-stone-300 bg-white focus:border-brand outline-none text-xs sm:text-sm font-extrabold text-stone-900"
                        />
                      </div>
                    </div>

                    {/* Color Rate */}
                    <div className="flex flex-col gap-1 bg-rose-50/70 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-rose-200">
                      <label className="text-[11px] sm:text-xs font-bold text-brand flex items-center justify-between">
                        <span>Color Rate</span>
                        <span className="text-[9px] sm:text-[10px] text-rose-500 font-semibold">₹ / pg</span>
                      </label>
                      <div className="relative flex items-center mt-0.5 sm:mt-1">
                        <span className="absolute left-3 text-brand font-bold text-xs sm:text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          required
                          value={registerData.colorRate}
                          onChange={(e) => updateRegisterData({ colorRate: Number(e.target.value) })}
                          className="w-full h-9 sm:h-10 pl-6 sm:pl-7 pr-2.5 rounded-lg sm:rounded-xl border border-rose-300 bg-white focus:border-brand outline-none text-xs sm:text-sm font-extrabold text-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hardware Check */}
                  <div className="bg-amber-50/70 border border-amber-200/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] sm:text-xs text-stone-800 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={registerData.hardwareReady}
                        onChange={(e) => updateRegisterData({ hardwareReady: e.target.checked })}
                        className="w-4 h-4 rounded border-stone-300 text-brand focus:ring-brand accent-brand mt-0.5 shrink-0"
                      />
                      <span>I have a Windows PC & Printer ready for 1-click desktop agent pairing.</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-1 sm:mt-2">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      className="btn btn-outline py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                    >
                      <span>Choose Plan</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUBSCRIPTION PLAN & PAYMENT */}
              {registerStep === 4 && (
                <div className="flex flex-col gap-3 sm:gap-3.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">Select Subscription Plan</h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Activate full Owner Dashboard & instant Windows printing</p>
                  </div>

                  {/* Plan Cards */}
                  <div className="flex flex-col gap-2.5">
                    {/* 1. Free Trial Demo */}
                    {isDemoAvailable && (
                      <div
                        onClick={() => {
                          setSelectedPlan('FREE_TRIAL')
                          updateRegisterData({ planType: 'FREE_TRIAL' })
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                          selectedPlan === 'FREE_TRIAL'
                            ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-bl-lg">
                          Free Trial · ₹0
                        </div>
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedPlan === 'FREE_TRIAL' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-300'
                          }`}>
                            {selectedPlan === 'FREE_TRIAL' && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">{demoDurationHours}-Hour Free Demo</span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">Test live printing for {demoDurationHours} hours free</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-sm sm:text-base font-extrabold text-stone-900">₹0</div>
                          <div className="text-[10px] text-amber-700 font-bold">Free</div>
                        </div>
                      </div>
                    )}

                    {/* 2. Monthly Plan */}
                    <div
                      onClick={() => {
                        setSelectedPlan('MONTHLY_299')
                        updateRegisterData({ planType: 'MONTHLY_299' })
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                        selectedPlan === 'MONTHLY_299'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-bl-lg">
                        {monthlyDiscountPercent > 0 ? `Save ${monthlyDiscountPercent}%` : 'Monthly'}
                      </div>
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedPlan === 'MONTHLY_299' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                        }`}>
                          {selectedPlan === 'MONTHLY_299' && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">Monthly Plan</span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">Owner dashboard, QR kiosk &amp; print agent</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-1.5 justify-end">
                          {monthlyOriginalPrice > monthlyPrice && (
                            <span className="text-[11px] text-stone-400 line-through">₹{monthlyOriginalPrice}</span>
                          )}
                          <div className="text-sm sm:text-base font-extrabold text-stone-900">₹{monthlyPrice}</div>
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-stone-500 font-semibold">/ 30 days</div>
                      </div>
                    </div>

                    {/* 3. Yearly Plan */}
                    <div
                      onClick={() => {
                        setSelectedPlan('YEARLY_799')
                        updateRegisterData({ planType: 'YEARLY_799' })
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                        selectedPlan === 'YEARLY_799'
                          ? 'border-brand bg-rose-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-brand text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-bl-lg">
                        Best Value · Save {yearlyDiscountPercent}%
                      </div>
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedPlan === 'YEARLY_799' ? 'border-brand bg-brand text-white' : 'border-stone-300'
                        }`}>
                          {selectedPlan === 'YEARLY_799' && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">Yearly Plan</span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium mt-0.5 truncate">365 Days — priority setup &amp; poster</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-1.5 justify-end">
                          {yearlyOriginalPrice > yearlyPrice && (
                            <span className="text-[11px] text-stone-400 line-through">
                              ₹{yearlyOriginalPrice}
                            </span>
                          )}
                          <div className="text-sm sm:text-base font-extrabold text-brand">₹{yearlyPrice}</div>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">1 Year</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-stone-500 bg-stone-100/70 p-2.5 rounded-xl border border-stone-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Secured by 256-bit encrypted Razorpay Gateway.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-1">
                    <button
                      type="button"
                      onClick={prevRegisterStep}
                      disabled={isSubmitting || isVerifying}
                      className="btn btn-outline py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerRazorpayCheckout(selectedPlan)}
                      disabled={isSubmitting || isVerifying}
                      className="btn btn-primary py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                    >
                      {isSubmitting || isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isVerifying ? 'Verifying...' : 'Processing...'}</span>
                        </>
                      ) : selectedPlan === 'FREE_TRIAL' ? (
                        <span>Activate Demo</span>
                      ) : selectedPlan === 'YEARLY_799' ? (
                        <span>Pay ₹{yearlyPrice}</span>
                      ) : (
                        <span>Pay ₹{monthlyPrice}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Switch Link */}
              <div className="border-t border-stone-200/80 pt-3 text-center text-xs text-stone-600 font-medium">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className="text-brand font-extrabold hover:underline cursor-pointer"
                >
                  Sign In to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-stone-200 flex flex-col gap-4 text-center relative"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-full bg-rose-50 text-brand flex items-center justify-center mx-auto">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 font-heading">Reset Password Assistance</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                For security reasons, password resets are handled via our official WhatsApp Support / Support Desk with shop verification.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/contact"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <span>Contact Support Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-ghost text-xs text-stone-500 hover:text-stone-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Payment (₹{selectedPlan === 'YEARLY_799' ? yearlyPrice : monthlyPrice})</span>
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
              <h3 className="text-xl font-extrabold text-stone-900 font-heading mt-2">Welcome to Scan&Print!</h3>
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
      <div className="relative z-10 text-center text-xs font-semibold text-stone-500 flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
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
        <span>·</span>
        <Link to="/contact" className="hover:text-stone-800 transition-colors">
          Support
        </Link>
      </div>

    </div>
  )
}
