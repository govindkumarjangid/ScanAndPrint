import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Check, QrCode, UploadCloud, FileText, CheckCircle2, CreditCard, Printer, heroSteps } from '../../assets/assets';

function PrintCounter({ duration = 2600 }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      setPct(Math.min(100, Math.round((elapsed / duration) * 100)));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  return <span>{pct}%</span>;
}

export default function Hero() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative pt-6 md:pt-14 px-4 sm:px-6 max-w-300 mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 flex flex-col items-start gap-6"
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-1.5 rounded-full text-brand text-xs sm:text-sm font-bold shadow-xs">
            <span>India's #1 Smart Printing Network for Shops</span>
          </div>

          {/* Headling */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
            Customers Scan QR Code &{' '}
            <span className="marker-highlight text-stone-900">Print Documents</span> Automatically!
          </h1>

          {/* Subheadling */}
          <p className="text-stone-600 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
            Stop manually asking customers for files on WhatsApp, downloading them, and printing. Let{' '}
            <span className="font-bold text-stone-900">Scan&Print</span> automate your entire printing workflow!
          </p>

          {/* CARDS */}
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 px-1">
              <span className="uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-brand" /> 4-Step Automated Workflow
              </span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                Auto-Cycling Live
              </span>
            </div>

            {/* Step Cards */}
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
                    className={`relative p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-2 cursor-pointer overflow-hidden ${isActive
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xl'
                      : 'bg-white text-stone-700 border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 shadow-2xs'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${isActive
                          ? 'bg-linear-to-tr from-brand to-brand/70 text-white shadow-md'
                          : 'bg-stone-100 text-stone-700'
                          }`}
                      >
                        {step.num}
                      </span>
                      <div
                        className={`p-1.5 rounded-lg ${isActive ? 'bg-white/10 text-amber-400' : 'bg-stone-100 text-stone-500'
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
                        className={`text-[10px] font-medium mt-0.5 truncate ${isActive ? 'text-stone-300' : 'text-stone-400'
                          }`}
                      >
                        {step.subtitle}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {isActive && (
                      <motion.div
                        key={`bar-${step.id}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.8, ease: 'linear' }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 to-brand"
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
                className="w-full sm:w-auto btn btn-primary px-8 py-4 text-base group"
              >
                <span>Register Shop</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" />
              </motion.button>
            </Link>

            <Link to="/features" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto btn btn-secondary px-7 py-4 text-base"
              >
                See Features
              </motion.button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 text-xs text-stone-500 font-semibold pt-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-3" /> 2 Min Setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-3" /> Unlimited Prints
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-3" /> Standard Printer Supported
            </span>
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative mx-auto max-w-md bg-stone-900 text-white rounded-3xl p-6 shadow-2xl border border-stone-700 overflow-hidden flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-700 pb-3">
              <div className="flex items-center gap-3">
                {/* Bezel */}
                <div className="relative flex h-4 w-4 items-center justify-center bg-stone-950 rounded-full border border-stone-700 shadow-inner">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#34d399]"></span>
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-stone-200">
                  {heroSteps[activeStep]?.label || "System"} Mode
                </span>
              </div>
              <span className="bg-stone-950 text-amber-400 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-stone-700 shadow-inner flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="bg-stone-950 rounded-2xl p-6 border border-stone-800 min-h-65 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="anim-scan"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className="relative w-40 h-40 bg-white rounded-3xl p-4 shadow-[0_0_30px_rgba(251,191,36,0.15)] flex items-center justify-center overflow-hidden group"
                  >
                    {/* Corner Reticles */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />

                    <QrCode className="w-28 h-28 text-stone-900" strokeWidth={1.5} />

                    {/* Glowing Laser Beam scanning up and down */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-amber-500 shadow-[0_0_15px_#f59e0b] z-10"
                    />
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-12 bg-linear-to-b from-transparent to-amber-500/20 z-0 -mt-12"
                    />
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="anim-upload"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col items-center justify-center gap-6"
                  >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Spinning outer rings */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/50"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-2 rounded-full border border-blue-400/30"
                      />
                      <UploadCloud className="w-16 h-16 text-blue-400 z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" strokeWidth={1.5} />
                    </div>

                    {/* Flying Document Files */}
                    <div className="absolute -bottom-8 flex flex-col gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 50, opacity: 0, scale: 0.5 }}
                          animate={{ y: -80, opacity: [0, 1, 0], scale: 1 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'easeOut'
                          }}
                          className="flex items-center gap-2 bg-stone-800 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/30 shadow-lg"
                        >
                          <FileText className="w-3 h-3 text-blue-400" />
                          <span>DATA_PACKET_{i}.pdf</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="anim-pay"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col items-center justify-center gap-5"
                  >
                    {/* Phone Tapping Animation */}
                    <div className="relative flex items-center justify-center w-full h-32">
                      <motion.div
                        initial={{ x: 50, rotate: 15, opacity: 0 }}
                        animate={{ x: 0, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="absolute z-10 bg-stone-800 border-2 border-stone-600 rounded-[20px] p-2 shadow-2xl"
                      >
                        <div className="w-14 h-24 bg-stone-900 rounded-xl flex flex-col items-center justify-center gap-2 border border-stone-700">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <div className="h-1 w-6 bg-stone-700 rounded-full" />
                          <div className="h-1 w-4 bg-stone-700 rounded-full" />
                        </div>
                      </motion.div>

                      {/* Ripple Effect */}
                      <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute w-16 h-16 bg-emerald-500/20 rounded-full z-0"
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-emerald-950/50 text-emerald-400 px-5 py-2 rounded-xl text-xs font-extrabold border border-emerald-500/40 flex items-center gap-3 backdrop-blur-sm"
                    >
                      <CreditCard className="w-5 h-5" />
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-emerald-500 uppercase">Payment Success</span>
                        <span>₹20 Paid via UPI</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    key="anim-process"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col items-center justify-center gap-4 w-full"
                  >
                    <div className="relative w-24 h-24">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-dashed border-rose-500/30 rounded-full"
                      />
                      {/* Sweeping "printhead" glow — suggests the head is scanning across */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'conic-gradient(from 0deg, rgba(244,63,94,0.4), transparent 35%)' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Printer className="w-10 h-10 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" strokeWidth={1.5} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-400 tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Rendering Document... <PrintCounter />
                    </span>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>


            <div className="bg-linear-to-b from-stone-700 to-stone-900 rounded-2xl p-1 pb-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-t border-stone-600 flex flex-col relative z-20">

              {/* Printer Top Control Panel Bezel */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-stone-800 bg-stone-800/50 rounded-t-xl">
                <div className="text-[9px] font-black tracking-widest text-stone-400">EPSON PRO-X</div>
                <div className="flex items-center gap-3">
                  {/* Power LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    <span className="text-[7px] text-stone-500 uppercase font-bold">Pwr</span>
                  </div>
                  {/* Wi-Fi LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6] animate-pulse" />
                    <span className="text-[7px] text-stone-500 uppercase font-bold">Net</span>
                  </div>
                  {/* Error/Print LED */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${activeStep === 3 ? 'bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]' : 'bg-stone-700'}`} />
                    <span className="text-[7px] text-stone-500 uppercase font-bold">Rdy</span>
                  </div>
                </div>
              </div>

              {/* Deep Paper Feed Slot */}
              <div className="mx-4 mt-4 h-5 bg-black rounded-lg border-b border-stone-600 border-t-2 border-t-black shadow-inner relative overflow-hidden flex items-center">
                {/* Moving Printhead */}
                <motion.div
                  animate={activeStep === 3 ? { x: [-150, 150, -150] } : { x: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 w-16 h-full bg-stone-800 border-x border-stone-600 rounded-sm z-10 flex items-center justify-center"
                >
                  <div className="w-8 h-1 bg-rose-500/50 blur-sm rounded-full" />
                </motion.div>
                {/* Internal slot shadow */}
                <div className="absolute inset-0 shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)] z-20 pointer-events-none" />
              </div>

              {/* Print job progress bar */}
              <div className="mx-4 mt-2 h-1 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  key={activeStep}
                  initial={{ width: '0%' }}
                  animate={{ width: activeStep === 3 ? '100%' : '0%' }}
                  transition={{ duration: activeStep === 3 ? 2.6 : 0, ease: 'linear' }}
                  className="h-full bg-rose-500"
                />
              </div>

              {/* Physical Paper Ejecting Area */}
              <div className="relative h-24 mx-6 flex justify-center -mt-1 overflow-hidden perspective-[1000px]">

                {/* The Paper Component */}
                <AnimatePresence>
                  {activeStep === 3 && (
                    <motion.div
                      initial={{ y: "-100%", rotateX: 45, opacity: 0 }}
                      animate={{ y: "10%", rotateX: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{
                        duration: 3,
                        ease: "linear",
                        opacity: { duration: 0.2 }
                      }}
                      className="absolute top-0 w-[90%] bg-white text-stone-900 p-3 rounded-b-md shadow-2xl border-x border-b border-stone-300 flex flex-col gap-2 origin-top"
                    >
                      {/* Paper Header */}
                      <div className="flex justify-between items-center text-rose-600 border-b-2 border-stone-100 pb-1">
                        <span className="text-[10px] font-black tracking-wide">Aadhaar_Card.pdf</span>
                        <QrCode className="w-4 h-4" />
                      </div>

                      {/* Fake Document Content */}
                      <div className="flex gap-2 mt-1">
                        <div className="w-10 h-12 bg-stone-200 rounded-sm border border-stone-300" />
                        <div className="flex-1 space-y-1.5">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
                            className="h-2 bg-stone-300 rounded w-full"
                          />
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ duration: 0.4, delay: 0.95, ease: 'easeOut' }}
                            className="h-2 bg-stone-200 rounded w-4/5"
                          />
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ duration: 0.4, delay: 1.3, ease: 'easeOut' }}
                            className="h-2 bg-stone-200 rounded w-3/4"
                          />
                        </div>
                      </div>

                      {/* Print Status overlay on paper — now with live % */}
                      <div className="absolute bottom-2 right-2 text-[8px] font-extrabold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        PRINTING <PrintCounter />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Plastic Tray Lip (covers the bottom of the paper to look like a tray) */}
                <div className="absolute bottom-0 w-[110%] h-4 bg-linear-to-t from-stone-800 to-transparent rounded-t-[50%] z-30" />
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}