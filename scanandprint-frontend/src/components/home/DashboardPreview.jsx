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
  // 3D Tilt Motion Values
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth, subtle, controlled tilt
  const mouseX = useSpring(x, { stiffness: 220, damping: 26 })
  const mouseY = useSpring(y, { stiffness: 220, damping: 26 })

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Subtle 3D rotation angles (subdued on mobile to prevent viewport overflow)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [5, -5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [-6, 6])

  // Dynamic 3D lighting / glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return
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
    <section className="px-3 sm:px-6 max-w-5xl mx-auto w-full py-4 overflow-hidden sm:overflow-visible">
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
        style={{ perspective: isMobile ? 'none' : '1200px' }}
        className="relative w-full max-w-full flex justify-center py-6 sm:py-8 select-none"
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
            transformStyle: isMobile ? 'flat' : 'preserve-3d',
          }}
          className="relative w-full max-w-full rounded-2xl sm:rounded-3xl bg-linear-to-br from-stone-900/95 via-stone-850/95 to-stone-950/95 p-1.5 sm:p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 cursor-grab active:cursor-grabbing transition-shadow duration-300 hover:shadow-[0_28px_60px_rgba(240,36,92,0.2)] backdrop-blur-md"
        >
          {/* FLOATING BADGE 1: Top Right Outer Anchor (Hardware Status - Desktop/Tablet Only) */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(45px)' }}
            className="absolute -top-3 sm:-top-4.5 right-3 sm:right-6 z-20 hidden sm:flex items-center gap-1.5 sm:gap-2 bg-stone-950/90 backdrop-blur-xl text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/20 ring-1 ring-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-xs font-semibold pointer-events-none"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Printer className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-300 uppercase tracking-wider font-semibold">Print Hardware</span>
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                Agent Online (Ready)
              </span>
            </div>
          </div>

          {/* FLOATING BADGE 2: Bottom Left Outer Anchor (Live Revenue - Desktop/Tablet Only) */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(45px)' }}
            className="absolute -bottom-3 sm:-bottom-4.5 left-3 sm:left-6 z-20 hidden sm:flex items-center gap-1.5 sm:gap-2 bg-stone-950/90 backdrop-blur-xl text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-emerald-400/40 ring-1 ring-emerald-400/20 shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-xs pointer-events-none"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-stone-300 uppercase tracking-wider font-semibold">Live Revenue</span>
              <span className="font-bold text-white flex items-center gap-1 text-[11px]">
                <span className="text-emerald-400 font-extrabold">₹4 Total Earnings</span>
                <span className="text-stone-300 text-[9px]">(4 Orders)</span>
              </span>
            </div>
          </div>

          {/* FLOATING BADGE 3: Bottom Right Outer Anchor (Auto-Dispatch - Desktop/Tablet Only) */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(50px)' }}
            className="absolute -bottom-3 sm:-bottom-4.5 right-3 sm:right-6 z-20 hidden sm:flex items-center gap-1.5 sm:gap-2 bg-stone-950/90 backdrop-blur-xl text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-amber-400/45 ring-1 ring-amber-400/25 shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-xs pointer-events-none"
          >
            <div className="w-6 h-6 rounded-md sm:rounded-lg bg-amber-400/25 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-amber-200 font-bold flex items-center gap-0.5 truncate">
                <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" /> Live Auto-Dispatch
              </span>
              <span className="font-extrabold text-white text-[11px] truncate">
                cl&eu-3,4.pdf • <span className="text-emerald-400">Printed</span>
              </span>
            </div>
          </div>

          {/* Glassmorphic Window Chrome Bar */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(20px)' }}
            className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 mb-1.5 sm:mb-2 bg-stone-950/60 backdrop-blur-xl rounded-xl border border-white/15 ring-1 ring-white/10 shadow-xs min-w-0"
          >
            {/* Traffic Light Window Dots */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/90 border border-rose-400/30 shadow-xs" />
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/90 border border-amber-400/30 shadow-xs" />
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/90 border border-emerald-400/30 shadow-xs" />
            </div>

            {/* Centered URL / Live Status */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-md text-[10px] sm:text-[11px] text-stone-300 font-mono min-w-0 max-w-[60%] sm:max-w-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-white font-semibold truncate">scanandprint.in</span>
              <span className="text-stone-400 hidden xs:inline truncate">/owner/dashboard</span>
              <span className="hidden sm:inline-block text-emerald-300 font-sans font-bold bg-emerald-500/20 px-1 rounded border border-emerald-400/30 text-[9px] shrink-0">
                LIVE
              </span>
            </div>

            {/* Right Status Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-stone-300 text-xs shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1 font-sans text-stone-200 font-medium text-xs">
                <Activity className="w-3 h-3 text-brand animate-pulse" />
                <span>Active</span>
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-400/30 backdrop-blur-md">
                <LiveClock />
              </span>
            </div>
          </div>

          {/* Main Dashboard Image (Unobstructed & 100% visible) */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(10px)', transformStyle: isMobile ? 'flat' : 'preserve-3d' }}
            className="relative rounded-xl overflow-hidden bg-stone-950 border border-white/10 shadow-inner group w-full max-w-full"
          >
            <picture>
              <source
                type="image/webp"
                srcSet="/images/main-landing-image-800.webp 800w, /images/main-landing-image-1200.webp 1200w, /images/main-landing-image-1920.webp 1920w"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1200px"
              />
              <img
                src="/images/main-landing-image-1200.webp"
                alt="Scan&Print Shop Owner Real-Time Dashboard Interface"
                width="1919"
                height="1079"
                className="w-full h-auto max-w-full object-contain rounded-xl backface:hidden"
                loading="eager"
                decoding="async"
              />
            </picture>

            {/* Dynamic Glare Reflection */}
            <motion.div
              style={{
                background: `radial-gradient(circle 450px at ${glareX} ${glareY}, rgba(255,255,255,0.08), transparent 70%)`,
              }}
              className="absolute inset-0 pointer-events-none mix-blend-overlay hidden sm:block"
            />
          </div>

          {/* Indicator */}
          <div
            style={{ transform: isMobile ? 'none' : 'translateZ(15px)' }}
            className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-stone-400 font-medium select-none text-center px-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>Interactive 3D Preview: Move cursor or touch to explore live depth</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}