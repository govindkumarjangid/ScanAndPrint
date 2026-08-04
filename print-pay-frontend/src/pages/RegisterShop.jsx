import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  KeyRound,
  Info,
  CheckCircle2,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import AnimatedDropdown, { PRINTER_BRANDS } from '../components/UI/AnimatedDropdown'

export default function RegisterShop() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Form State
  const [shopName, setShopName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [printerBrand, setPrinterBrand] = useState('')
  const [printerModel, setPrinterModel] = useState('')
  const [password, setPassword] = useState('')

  // Print Rates
  const [bwRate, setBwRate] = useState(5)
  const [colorRate, setColorRate] = useState(10)

  // Plan Selection: 'monthly' or 'onetime'
  const initialPlan = searchParams.get('plan') === 'onetime' ? 'onetime' : 'monthly'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)

  // Validation & Shake state
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync initial query param if changed
  useEffect(() => {
    if (searchParams.get('plan') === 'onetime') {
      setSelectedPlan('onetime')
    }
  }, [searchParams])

  const currentPrice = selectedPlan === 'monthly' ? 399 : 599

  const validate = () => {
    const errs = {}
    if (!shopName.trim()) errs.shopName = 'Shop ka naam zaroori hai'
    if (!email.trim()) errs.email = 'Email address zaroori hai'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Sahi email address daalein'
    if (!printerBrand) errs.printerBrand = 'Printer brand select karein'
    if (!password) errs.password = 'Password zaroori hai'
    else if (password.length < 4) errs.password = 'Password kam se kam 4 characters ka hona chahiye'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    const payload = {
      shopName,
      address,
      phone,
      email,
      printerBrand,
      printerModel,
      password,
      bwRate,
      colorRate,
      selectedPlan,
      amount: currentPrice,
    }

    console.log('Registration submitted:', payload)

    setTimeout(() => {
      setIsSubmitting(false)
      // Navigate to shop-login on success
      navigate('/shop-login', { state: { registeredShopName: shopName } })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] py-8 px-4 sm:px-6 max-w-[1000px] mx-auto">
      
      {/* Header Row */}
      <div className="flex items-center justify-between pb-8 border-b border-stone-200/80 mb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#F0245C] text-white flex items-center justify-center shadow-md">
            <Printer className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-stone-900">
            QR Se <span className="text-[#F0245C]">Print</span>
          </span>
        </Link>

        <Link to="/shop-login">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-[#F0245C]/10 text-[#F0245C] hover:bg-[#F0245C] hover:text-white px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>🔑 Shop Login</span>
          </motion.button>
        </Link>
      </div>

      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Apni Shop <span className="marker-highlight">Register</span> Karo
        </h1>
        <p className="text-stone-600 text-base sm:text-lg mt-3 font-medium">
          2 minute ka form — phir setup fee, phir QR Code + Print Agent ready
        </p>
      </div>

      {/* Form Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        
        {/* CARD - STEP 1: SHOP DETAILS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-900 font-extrabold text-lg flex items-center justify-center shadow-2xs">
              1
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Shop Details</h2>
              <p className="text-xs text-stone-500">Apni cyber cafe ya print shop ki jankari bharein</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Shop ka Naam */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Shop ka Naam *
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Sharma Cyber Cafe"
                className={`h-12 px-4 rounded-xl border text-sm font-medium outline-none transition-all ${
                  errors.shopName ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20'
                }`}
              />
              {errors.shopName && <span className="text-xs text-rose-600 font-medium">{errors.shopName}</span>}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Main Road, Khowai"
                className="h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aapka@email.com"
                className={`h-12 px-4 rounded-xl border text-sm font-medium outline-none transition-all ${
                  errors.email ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20'
                }`}
              />
              {errors.email ? (
                <span className="text-xs text-rose-600 font-medium">{errors.email}</span>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-0.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Payment ki receipt aur Shop ID isi email par bheje jaayenge.</span>
                </div>
              )}
            </div>

            {/* Two-Column Row: Printer Brand & Printer Model */}
            <div className="flex flex-col sm:flex-row gap-5 sm:col-span-2">
              <div className="flex-1">
                <AnimatedDropdown
                  label="Printer Brand *"
                  value={printerBrand}
                  onChange={setPrinterBrand}
                  placeholder="-- Brand select karo --"
                  error={errors.printerBrand}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Printer Model
                </label>
                <input
                  type="text"
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  placeholder="e.g. L3210"
                  className="h-11 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Print Output Printer (Disabled style input with helper) */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Print Output Printer
              </label>
              <div className="h-12 px-4 rounded-xl bg-stone-100 border border-stone-300 text-stone-700 flex items-center font-semibold text-sm cursor-not-allowed">
                🖨️ System Default Printer (Auto-selected)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Print Agent aapke PC ke default printer par automatically print karega — koi manual setup nahi.</span>
              </div>
            </div>

            {/* Login Password */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Login Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`h-12 px-4 rounded-xl border text-sm font-medium outline-none transition-all ${
                  errors.password ? 'border-rose-500 ring-2 ring-rose-200' : 'border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20'
                }`}
              />
              {errors.password ? (
                <span className="text-xs text-rose-600 font-medium">{errors.password}</span>
              ) : (
                <span className="text-xs text-stone-400 font-medium">(kam se kam 4 characters)</span>
              )}
            </div>

          </div>
        </div>

        {/* CARD - STEP 2: PRINT RATE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-900 font-extrabold text-lg flex items-center justify-center shadow-2xs">
                2
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Print Rate</h2>
                <p className="text-xs text-stone-500">customer se per page kitna loge</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <span>⚫ B&W (₹/page)</span>
              </label>
              <input
                type="number"
                min="1"
                value={bwRate}
                onChange={(e) => setBwRate(Number(e.target.value))}
                className="h-11 px-4 rounded-xl border border-stone-300 bg-white focus:border-[#F0245C] outline-none text-base font-extrabold text-stone-900"
              />
            </div>

            <div className="flex flex-col gap-1.5 bg-rose-50/50 p-4 rounded-2xl border border-rose-200/70">
              <label className="text-xs font-bold uppercase tracking-wider text-[#F0245C] flex items-center gap-1.5">
                <span>🌈 Color (₹/page)</span>
              </label>
              <input
                type="number"
                min="1"
                value={colorRate}
                onChange={(e) => setColorRate(Number(e.target.value))}
                className="h-11 px-4 rounded-xl border border-stone-300 bg-white focus:border-[#F0245C] outline-none text-base font-extrabold text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* CARD - STEP 3: PLAN SELECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-900 font-extrabold text-lg flex items-center justify-center shadow-2xs">
                3
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Customer Payment Kaise Lena Hai</h2>
                <p className="text-xs font-bold text-[#F0245C] tracking-wide uppercase mt-0.5">PLAN CHUNO</p>
              </div>
            </div>
          </div>

          {/* Side by side radio plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Monthly Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === 'monthly'
                  ? 'border-[#F0245C] bg-rose-50/30 shadow-lg ring-4 ring-[#F0245C]/15'
                  : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-stone-900 text-lg">Monthly Plan</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'monthly'
                        ? 'border-[#F0245C] bg-[#F0245C] text-white'
                        : 'border-stone-400'
                    }`}
                  >
                    {selectedPlan === 'monthly' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-stone-500 mb-4">
                  Har mahine time par pay karo — tabhi service active rahegi
                </p>

                <div className="text-3xl font-extrabold text-stone-900 mb-4">
                  ₹399 <span className="text-xs font-semibold text-stone-500">/mahina</span>
                </div>

                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex items-center gap-2">✓ Auto Print Software</div>
                  <div className="flex items-center gap-2">✓ Personalize QR For Shop</div>
                  <div className="flex items-center gap-2">✓ Unlimited Print</div>
                  <div className="flex items-center gap-2">✓ Assistant in Setup</div>
                  <div className="flex items-center gap-2">✓ WhatsApp Assistant</div>
                </div>
              </div>
            </motion.div>

            {/* One-Time Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('onetime')}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === 'onetime'
                  ? 'border-[#F0245C] bg-rose-50/30 shadow-lg ring-4 ring-[#F0245C]/15'
                  : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-3 right-4 bg-amber-400 text-stone-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                BEST VALUE
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-stone-900 text-lg">One-Time Plan</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'onetime'
                        ? 'border-[#F0245C] bg-[#F0245C] text-white'
                        : 'border-stone-400'
                    }`}
                  >
                    {selectedPlan === 'onetime' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-stone-500 mb-4">
                  Ek baar pay — Lifetime Access & Update — No renewal kabhi nahi
                </p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-stone-400 line-through text-sm font-bold">₹3,999</span>
                  <span className="text-3xl font-extrabold text-[#F0245C]">₹599</span>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Lifetime
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-800 font-medium">
                  <div className="flex items-center gap-2">✓ Auto Print Software</div>
                  <div className="flex items-center gap-2">✓ Personalize QR For Shop</div>
                  <div className="flex items-center gap-2">✓ Unlimited Print</div>
                  <div className="flex items-center gap-2 text-amber-900 font-bold bg-amber-100/60 px-2 py-1 rounded">
                    ⚡ Payment Gateway Setup Assistant
                  </div>
                  <div className="flex items-center gap-2 text-amber-900 font-bold bg-amber-100/60 px-2 py-1 rounded">
                    ⚡ Bug Fix Within 2Hr
                  </div>
                  <div className="flex items-center gap-2">✓ AnyDesk Assistant</div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Yellow info callout box */}
          <div className="bg-amber-50 border border-amber-300/80 p-5 rounded-2xl flex items-start gap-3.5 text-stone-800 text-xs sm:text-sm leading-relaxed">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <strong>Payment kaise receive karna hai (Counter/Online)</strong>, kaun sa printer B&W ke liye, kaun sa Color, kaun sa Duplex — ye saari settings register ke baad <strong>Shop Login → Settings</strong> mein milegi.
              <br className="my-1" />
              Register karne ke baad: pehle Software Download karo, phir Settings mein jaake Printer aur Payment options update karo.
            </div>
          </div>
        </div>

        {/* Dynamic CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#F0245C] hover:bg-[#D81B4E] text-white font-extrabold text-lg py-5 rounded-full shadow-xl shadow-[#F0245C]/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>
            {isSubmitting
              ? 'Processing Registration...'
              : `Register Karo — Agla Step: ₹${currentPrice} ${selectedPlan === 'monthly' ? '(pehla mahina)' : '(lifetime)'} ›`}
          </span>
        </motion.button>
      </motion.form>

    </div>
  )
}
