import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Zap,
  ArrowRight,
  Check,
  QrCode,
  UploadCloud,
  FileText,
  CheckCircle2,
  CreditCard,
  Printer,
  heroSteps,
} from '../../assets/assets'

export default function Hero() {
  const [activeStep, setActiveStep] = useState(0)

  // Infinite cycle timer (changes step every 2.8s)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative pt-6 md:pt-14 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Hero Left Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 flex flex-col items-start gap-6"
        >
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-300/80 px-4 py-1.5 rounded-full text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>India's #1 Smart Printing Network for Shops</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
            Customers Scan QR Code &{' '}
            <span className="marker-highlight text-stone-900">Print Documents</span> Automatically!
          </h1>

          {/* Subheadline */}
          <p className="text-stone-600 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
            Stop manually asking customers for files on WhatsApp, downloading them, and printing. Let{' '}
            <span className="font-bold text-stone-900">QR Se Print</span> automate your entire printing workflow!
          </p>

          {/* 4 INTERACTIVE STEP CARDS */}
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
              <span className="uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-[#F0245C]" /> 4-Step Automated Workflow
              </span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Auto-Cycling Live
              </span>
            </div>

            {/* Step Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative">
              {heroSteps.map((step) => {
                const isActive = activeStep === step.id
                const Icon = step.icon
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-2 cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xl ring-4 ring-[#F0245C]/20'
                        : 'bg-white text-stone-700 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                          isActive
                            ? 'bg-gradient-to-tr from-[#F0245C] to-[#ff4d7e] text-white shadow-md'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {step.num}
                      </span>
                      <div
                        className={`p-1.5 rounded-lg ${
                          isActive ? 'bg-white/10 text-amber-400' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs sm:text-sm tracking-tight leading-snug">
                        {step.label}
                      </span>
                      <span
                        className={`text-[10px] font-medium mt-0.5 truncate ${
                          isActive ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {step.subtitle}
                      </span>
                    </div>

                    {/* Active Progress Bar */}
                    {isActive && (
                      <motion.div
                        key={`bar-${step.id}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.8, ease: 'linear' }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-[#F0245C]"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto btn-primary px-8 py-4 text-base flex items-center justify-center gap-2"
              >
                <span>Register Shop</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link to="/features" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto btn-secondary px-7 py-4 text-base flex items-center justify-center"
              >
                See Features
              </motion.button>
            </Link>
          </div>

          {/* Quick Trust badges */}
          <div className="flex items-center gap-6 text-xs text-stone-500 font-semibold pt-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 2 Min Setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Unlimited Prints
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Standard Printer Supported
            </span>
          </div>
        </motion.div>

        {/* HERO RIGHT: CLEAN PURE GRAPHIC ANIMATION STAGE (ONLY ANIMATED ICONS & MACHINE) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative mx-auto max-w-md bg-stone-900 text-white rounded-3xl p-6 shadow-2xl border border-stone-800 overflow-hidden flex flex-col gap-6">
            
            {/* Top Status LED Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  {heroSteps[activeStep].label} Mode
                </span>
              </div>
              <span className="bg-stone-800 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-stone-700">
                LIVE ANIMATION
              </span>
            </div>

            {/* PURE ANIMATED GRAPHIC CANVAS (NO TEXT CLUTTER) */}
            <div className="bg-stone-950 rounded-2xl p-6 border border-stone-800 min-h-[240px] flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. SCANNING ANIMATION ONLY */}
                {activeStep === 0 && (
                  <motion.div
                    key="anim-scan"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-36 h-36 bg-white rounded-3xl p-3 shadow-2xl border-4 border-amber-400 flex items-center justify-center overflow-hidden"
                  >
                    <QrCode className="w-28 h-28 text-stone-900" />
                    {/* Glowing Laser Beam scanning up and down */}
                    <motion.div
                      animate={{ y: [-50, 50, -50] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#F0245C] to-transparent shadow-lg shadow-[#F0245C]"
                    />
                  </motion.div>
                )}

                {/* 2. UPLOADING ANIMATION ONLY */}
                {activeStep === 1 && (
                  <motion.div
                    key="anim-upload"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative w-28 h-28 rounded-full bg-blue-500/20 text-blue-400 border-2 border-blue-500/40 flex items-center justify-center">
                      {/* Spinning upload ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400"
                      />
                      <UploadCloud className="w-14 h-14" />
                    </div>

                    {/* Flying Document Files */}
                    <motion.div
                      animate={{ y: [15, -15, 15], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center gap-2 bg-stone-800 text-blue-300 px-4 py-1.5 rounded-full text-xs font-extrabold border border-blue-500/30"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Uploading PDF...</span>
                    </motion.div>
                  </motion.div>
                )}

                {/* 3. PAYMENT ANIMATION ONLY */}
                {activeStep === 2 && (
                  <motion.div
                    key="anim-pay"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col items-center justify-center gap-4"
                  >
                    {/* Glowing Checkmark Pulse */}
                    <motion.div
                      animate={{ scale: [0.9, 1.15, 0.9] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-28 h-28 rounded-3xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
                    </motion.div>

                    <div className="bg-stone-800 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-extrabold border border-emerald-500/40 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>₹20 Paid via UPI</span>
                    </div>
                  </motion.div>
                )}

                {/* 4. PRINTING ANIMATION ONLY */}
                {activeStep === 3 && (
                  <motion.div
                    key="anim-print"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col items-center justify-center gap-3 w-full"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-rose-500/20 text-brand flex items-center justify-center border border-brand/40">
                      <Printer className="w-12 h-12 animate-pulse" />
                    </div>

                    {/* Animated printed page sliding down */}
                    <motion.div
                      animate={{ y: [-15, 10] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="w-48 bg-white text-stone-900 p-3 rounded-xl shadow-2xl border border-stone-300 flex flex-col gap-1.5 text-[11px] font-bold"
                    >
                      <div className="flex justify-between items-center text-brand border-b pb-1">
                        <span>Aadhaar_Card.pdf</span>
                        <span className="text-[9px] bg-rose-100 px-1.5 py-0.5 rounded">COLOR</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-stone-300 rounded w-full"></div>
                        <div className="h-1.5 bg-stone-200 rounded w-4/5"></div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* REALISTIC PRINTER MACHINE HARDWARE BODY */}
            <div className="bg-stone-800 rounded-2xl p-4 border border-stone-700 flex flex-col gap-3 relative">
              {/* Printer Output Slot */}
              <div className="w-full h-3 bg-stone-950 rounded-full border border-stone-700 relative overflow-hidden flex items-center justify-center">
                <motion.div
                  animate={{ x: [-100, 100, -100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-full bg-brand/70 blur-xs"
                />
              </div>

              {/* Page sliding out of slot */}
              <div className="h-12 overflow-hidden flex items-center justify-center">
                <motion.div
                  animate={{ y: [-10, 10], opacity: [0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="w-[85%] bg-white text-stone-900 px-3 py-1.5 rounded-lg shadow-md border border-stone-300 text-xs font-bold flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5 text-stone-800">
                    <Printer className="w-3.5 h-3.5 text-brand" /> EPSON Auto-Output
                  </span>
                  <span className="text-emerald-600 text-[10px] font-extrabold bg-emerald-50 px-2 py-0.5 rounded">
                    PRINTING
                  </span>
                </motion.div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}