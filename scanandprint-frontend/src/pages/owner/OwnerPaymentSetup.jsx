import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Globe,
  Banknote,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Key,
  Lock,
  Info,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPaymentSetup() {
  const { currentShop, fetchProfile, updatePaymentSettings, isSavingPayment } = useAuthStore()

  const [paymentMode, setPaymentMode] = useState(currentShop?.paymentSettings?.paymentMode || 'online_counter')
  const [razorpayKeyId, setRazorpayKeyId] = useState(currentShop?.paymentSettings?.razorpayKeyId || '')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  // Check if keys are already saved (masked)
  const hasExistingKeys = currentShop?.paymentSettings?.isRazorpayConfigured ?? false

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (currentShop?.paymentSettings) {
      if (currentShop.paymentSettings.paymentMode) setPaymentMode(currentShop.paymentSettings.paymentMode)
      if (currentShop.paymentSettings.razorpayKeyId) setRazorpayKeyId(currentShop.paymentSettings.razorpayKeyId)
    }
  }, [currentShop])

  const handleSave = async (e) => {
    e.preventDefault()

    // Validation: if online mode selected, keys are required
    if (paymentMode !== 'counter') {
      if (!razorpayKeyId.trim()) {
        toast.error('Razorpay Key ID is required for online payments')
        return
      }
      if (!hasExistingKeys && !razorpayKeySecret.trim()) {
        toast.error('Razorpay Key Secret is required')
        return
      }
    }

    const payload = {
      paymentMode,
      paymentGateway: 'razorpay',
      razorpayKeyId: razorpayKeyId.trim(),
    }

    // Only send secret if user entered a new one
    if (razorpayKeySecret.trim()) {
      payload.razorpayKeySecret = razorpayKeySecret.trim()
    }

    await updatePaymentSettings(payload)
    setRazorpayKeySecret('') // Clear secret field after save
  }

  const isOnlineMode = paymentMode === 'online_counter' || paymentMode === 'online'

  // Razorpay Setup Guide Steps
  const guideSteps = [
    {
      step: 1,
      title: 'Razorpay Dashboard पर जाएँ',
      desc: 'अपने ब्राउज़र में dashboard.razorpay.com खोलें और अपने Account से Login करें। अगर Account नहीं है तो "Sign Up" पर क्लिक करके नया Account बनाएँ।',
      link: 'https://dashboard.razorpay.com',
    },
    {
      step: 2,
      title: 'Account Settings में जाएँ',
      desc: 'Login करने के बाद, Left sidebar में "Settings" पर क्लिक करें, फिर "API Keys" tab पर जाएँ।',
    },
    {
      step: 3,
      title: 'Generate Key पर क्लिक करें',
      desc: '"Generate Key" button पर क्लिक करें। आपको Key ID (जैसे rzp_live_xxxxx) और Key Secret दोनों दिखेंगे।',
    },
    {
      step: 4,
      title: 'Key ID & Secret Copy करें',
      desc: '⚠️ Key Secret सिर्फ एक बार दिखेगा! दोनों को कहीं Safe जगह Copy करके रखें, फिर नीचे दिए गए inputs में Paste करें।',
    },
    {
      step: 5,
      title: 'Test Mode vs Live Mode',
      desc: 'Testing के लिए "Test Mode" Keys use करें (rzp_test_xxxxx)। Real Payments के लिए "Live Mode" Keys Generate करें (rzp_live_xxxxx)।',
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
        <div className="bg-emerald-500/50 p-3 rounded-2xl mb-3">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Razorpay Payment Setup
        </h1>
        <p className="text-emerald-100 text-sm mt-1 font-medium max-w-md">
          Setup your Razorpay keys to accept online UPI, Card & NetBanking payments from customers
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* PAYMENT MODE SECTION */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 ml-1">
            Payment Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* ONLINE + COUNTER */}
            <label
              onClick={() => setPaymentMode('online_counter')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'online_counter'
                  ? 'border-brand bg-linear-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10'
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'online_counter' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'online_counter' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>

              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'online_counter' ? 'bg-brand/10' : 'bg-blue-50 group-hover:bg-blue-100/80'}`}>
                <CreditCard className={`w-6 h-6 ${paymentMode === 'online_counter' ? 'text-brand' : 'text-blue-500'}`} />
              </div>

              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'online_counter' ? 'text-stone-900' : 'text-stone-700'}`}>ONLINE + COUNTER</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">THE CUSTOMER GETS BOTH OPTIONS</span>
              </div>
            </label>

            {/* ONLINE ONLY */}
            <label
              onClick={() => setPaymentMode('online')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'online'
                  ? 'border-brand bg-linear-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10'
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'online' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'online' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>

              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'online' ? 'bg-brand/10' : 'bg-cyan-50 group-hover:bg-cyan-100/80'}`}>
                <Globe className={`w-6 h-6 ${paymentMode === 'online' ? 'text-brand' : 'text-cyan-500'}`} />
              </div>

              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'online' ? 'text-stone-900' : 'text-stone-700'}`}>ONLINE ONLY</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">ONLINE PAYMENT ONLY, NO COUNTER</span>
              </div>
            </label>

            {/* COUNTER ONLY */}
            <label
              onClick={() => setPaymentMode('counter')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'counter'
                  ? 'border-brand bg-linear-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10'
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'counter' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'counter' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>

              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'counter' ? 'bg-brand/10' : 'bg-emerald-50 group-hover:bg-emerald-100/80'}`}>
                <Banknote className={`w-6 h-6 ${paymentMode === 'counter' ? 'text-brand' : 'text-emerald-500'}`} />
              </div>

              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'counter' ? 'text-stone-900' : 'text-stone-700'}`}>COUNTER ONLY</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">CASH AT THE COUNTER ONLY</span>
              </div>
            </label>

          </div>
        </div>

        {/* RAZORPAY KEY INPUTS SECTION */}
        {isOnlineMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-5 mt-2"
          >
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 ml-1 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-brand" />
              Razorpay API Keys Configuration
            </label>

            {/* Status Badge */}
            {hasExistingKeys && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Razorpay Keys Already Configured ✅ — Update below to change them</span>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-5">

              {/* Key ID Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-brand" />
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_live_xxxxxxxxx or rzp_test_xxxxxxxxx"
                  className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-mono"
                />
                <span className="text-[11px] text-stone-400 font-medium ml-1">
                  Example: rzp_live_TBRpwJ4pTFgPiY (starts with rzp_live_ or rzp_test_)
                </span>
              </div>

              {/* Key Secret Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-brand" />
                  Razorpay Key Secret
                  {hasExistingKeys && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 ml-1 normal-case">
                      Leave empty to keep current
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder={hasExistingKeys ? '•••••••••• (saved & encrypted)' : 'Enter your Key Secret'}
                    className="w-full h-12 px-4 pr-12 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium ml-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Your Key Secret is encrypted (bcrypt) before saving — never stored in plain text</span>
                </div>
              </div>

            </div>

            {/* HOW TO GET RAZORPAY KEYS - Expandable Guide */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setGuideOpen(!guideOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-stone-900">
                      📖 Razorpay से Key ID & Secret कैसे लें?
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      Step-by-step guide in Hindi — Click to {guideOpen ? 'close' : 'expand'}
                    </span>
                  </div>
                </div>
                {guideOpen ? (
                  <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {guideOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 flex flex-col gap-4 border-t border-stone-100 pt-4">
                      {guideSteps.map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shrink-0 font-extrabold text-xs shadow-md shadow-rose-500/20">
                            {item.step}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-sm font-extrabold text-stone-900">{item.title}</span>
                            <span className="text-xs text-stone-600 font-medium leading-relaxed">{item.desc}</span>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-1 w-max"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open Razorpay Dashboard →</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Quick Test Key Tip */}
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2.5">
                        <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 fill-amber-600" />
                        <div>
                          <strong>Quick Testing Tip:</strong> Use Test Mode Keys (rzp_test_xxxxx) to test without real money.
                          Switch to Live Mode Keys (rzp_live_xxxxx) when you're ready for real payments.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* SAVE BUTTON */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSavingPayment}
            className="btn btn-primary py-4 mt-4 px-8 flex items-center gap-2"
          >
            {isSavingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingPayment ? 'Saving Payment Settings...' : 'Save Payment Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}
