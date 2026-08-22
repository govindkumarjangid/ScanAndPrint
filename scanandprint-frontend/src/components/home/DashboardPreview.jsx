import { useState, useEffect, useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Printer,
  TrendingUp,
  Clock,
  Activity,
  ShieldCheck,
} from '../../assets/assets';

// Isolated LiveClock component to prevent re-rendering the heavy 3D Framer Motion perspective card every second
const LiveClock = memo(function LiveClock() {
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])
  return <span>{timeStr || 'Live Sync'}</span>
})

export default function DashboardPreview() {
  const [activeJobsCount, setActiveJobsCount] = useState(14)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveJobsCount((prev) => (prev > 25 ? 12 : prev + 1))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // 3D Tilt Motion Values
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth, subtle, controlled tilt
  const mouseX = useSpring(x, { stiffness: 220, damping: 26 })
  const mouseY = useSpring(y, { stiffness: 220, damping: 26 })

  // Subtle 3D rotation angles
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6.5, -6.5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8.5, 8.5])

  // Dynamic 3D lighting / glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseXPos = (e.clientX - rect.left) / width - 0.5
    const mouseYPos = (e.clientY - rect.top) / height - 0.5

    x.set(mouseXPos)
    y.set(mouseYPos)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-4 overflow-visible">
      {/* Header: Badge, Time, Title, and Subtitle */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 sm:mb-8 gap-3">
        {/* Real-time Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-linear-to-r from-amber-100/90 via-rose-50 to-amber-100/90 border border-amber-300/60 shadow-xs text-xs font-semibold text-stone-800"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-stone-900">Real-Time Shop Dashboard</span>
          <span className="text-stone-300">|</span>
          <span className="flex items-center gap-1 font-mono text-stone-600 font-bold text-[11px] bg-white/80 px-2 py-0.5 rounded-full border border-stone-200/60">
            <Clock className="w-3 h-3 text-brand" />
            <LiveClock />
          </span>
        </motion.div>

        {/* Bold Title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight"
        >
          Supercharged Control Center for{' '}
          <span className="marker-highlight text-stone-900">Every Print Shop</span>
        </motion.h2>

        {/* Compact Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal"
        >
          Track incoming customer print jobs live, configure custom per-page pricing, manage multiple desktop printers,
          and monitor daily cash revenue — all automated in real-time.
        </motion.p>

        {/* Highlights Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-stone-200/80 text-stone-700 shadow-2xs font-semibold">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>0s Latency Sync</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-stone-200/80 text-stone-700 shadow-2xs font-semibold">
            <Printer className="w-3 h-3 text-brand" />
            <span>Multi-Printer Auto Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-stone-200/80 text-stone-700 shadow-2xs font-semibold">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Live Revenue Analytics</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-stone-200/80 text-stone-700 shadow-2xs font-semibold">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Auto Cleanup</span>
          </div>
        </motion.div>
      </div>

      {/* 3D PERSPECTIVE */}
      <div
        style={{ perspective: '1200px' }}
        className="relative w-full flex justify-center py-2 select-none"
      >
        {/* Backlight Glow */}
        <div className="absolute -inset-3 bg-linear-to-r from-amber-400/20 via-rose-400/15 to-amber-300/20 rounded-3xl blur-xl opacity-60 -z-10 pointer-events-none transform-gpu" />

        {/* 3D Tilted Card Container */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full rounded-2xl sm:rounded-3xl bg-linear-to-br from-stone-900/95 via-stone-850/95 to-stone-950/95 p-2 sm:p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 cursor-grab active:cursor-grabbing transition-shadow duration-300 hover:shadow-[0_28px_60px_rgba(240,36,92,0.2)] backdrop-blur-md"
        >
          {/* Glassmorphic Window Chrome Bar */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="flex items-center justify-between px-3 py-2 mb-2 bg-stone-950/40 backdrop-blur-xl rounded-xl border border-white/15 ring-1 ring-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
          >
            {/* Traffic Light Window Dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 border border-rose-400/30 shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 border border-amber-400/30 shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 border border-emerald-400/30 shadow-xs" />
            </div>

            {/* Centered URL / Live Status */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-stone-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-semibold">scanandprint.in</span>
              <span className="text-stone-400">/owner/dashboard</span>
              <span className="hidden sm:inline-block text-emerald-300 font-sans font-bold bg-emerald-500/20 px-1 rounded border border-emerald-400/30 text-[9px]">
                LIVE
              </span>
            </div>

            {/* Right Status Indicator */}
            <div className="flex items-center gap-2 text-stone-300 text-xs">
              <span className="hidden sm:inline-flex items-center gap-1 font-sans text-stone-200 font-medium text-xs">
                <Activity className="w-3 h-3 text-brand animate-pulse" />
                <span>Active</span>
              </span>
              <span className="font-mono text-[10px] text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-400/30 backdrop-blur-md">
                <LiveClock />
              </span>
            </div>
          </div>

          {/* Main Dashboard Image  */}
          <div
            style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}
            className="relative rounded-xl overflow-hidden bg-stone-950 border border-white/10 shadow-inner group"
          >
            <picture>
              <source
                type="image/webp"
                srcSet="/images/main-landing-image-800.webp 800w, /images/main-landing-image-1200.webp 1200w"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
              <img
                src="/images/main-landing-image-1200.webp"
                alt="Scan&Print Shop Owner Real-Time Dashboard Interface"
                width="1200"
                height="679"
                className="w-full h-auto object-cover rounded-xl backface:hidden transform:[translateZ(0)]"
                loading="lazy"
                decoding="async"
              />
            </picture>

            {/* Dynamic Glare Reflection */}
            <motion.div
              style={{
                background: `radial-gradient(circle 450px at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 70%)`,
              }}
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
            />

            {/* Bottom Vignette */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-stone-950/40 to-transparent pointer-events-none" />

            {/*  Badge 1: Top Left Printer Status */}
            <div
              style={{ transform: 'translateZ(35px)' }}
              className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 hidden sm:flex items-center gap-2 bg-stone-950/50 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl border border-white/20 ring-1 ring-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-xs font-semibold pointer-events-none"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Printer className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-stone-300 uppercase tracking-wider font-medium">Default Printer</span>
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  EPSON L3210 (Ready)
                </span>
              </div>
            </div>

            {/*Badge 2: Bottom Right Live Print Order */}
            <div
              style={{ transform: 'translateZ(40px)' }}
              className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 flex items-center gap-2 bg-stone-950/55 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl border border-amber-400/35 ring-1 ring-amber-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-xs pointer-events-none"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-400/25 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-200 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Auto-Printed Just Now
                </span>
                <span className="font-extrabold text-white text-[11px]">
                  4 Pages B&W • <span className="text-emerald-400">₹8.00 Paid</span>
                </span>
              </div>
            </div>

            {/* Badge 3: Bottom Left Live Revenue Counter */}
            <div
              style={{ transform: 'translateZ(38px)' }}
              className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 hidden md:flex items-center gap-2 bg-stone-950/50 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl border border-emerald-400/35 ring-1 ring-emerald-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-xs pointer-events-none"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-stone-300 uppercase tracking-wider font-medium">Live Revenue</span>
                <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                  <span className="text-emerald-400 font-extrabold">₹1,480.00</span>
                  <span className="text-stone-300 text-[9px]">({activeJobsCount} Jobs)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Indicator */}
          <div
            style={{ transform: 'translateZ(15px)' }}
            className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Interactive 3D Preview: Move cursor to explore live depth</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}