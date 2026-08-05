import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Printer,
  ShieldCheck,
  Building2,
  GraduationCap,
  BookOpen,
  Store,
  Layers,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// "Who it's for" audience list
const audienceList = [
  { icon: Store, title: 'Cyber Cafes', desc: 'Eliminate long queues with instant automatic printing.' },
  { icon: Printer, title: 'Print & Xerox Shops', desc: 'Customers print photos and PDFs directly from their phones.' },
  { icon: ShieldCheck, title: 'CSC Centers', desc: 'Process government digital services fast and hassle-free.' },
  { icon: Building2, title: 'Digital Service Centres', desc: 'Direct phone-to-printer workflow without sharing WhatsApp.' },
  { icon: GraduationCap, title: 'Schools & Colleges', desc: 'Quick student notes and admit card printouts.' },
  { icon: BookOpen, title: 'Coaching Institutes', desc: 'Instant assignment and test paper printing.' },
  { icon: Layers, title: 'Libraries & Offices', desc: 'Convenient self-service document printing.' },
  { icon: TrendingUp, title: 'Small & Medium Businesses', desc: 'Digital payments and auto-printing combined.' },
]

export default function AudienceGrid() {
  const carouselRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(2) // Default center focus index
  const [isPaused, setIsPaused] = useState(false)

  // Navigation handlers
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % audienceList.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + audienceList.length) % audienceList.length)
  }

  // Auto-scroll loop every 3 seconds
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      handleNext()
    }, 3000)
    return () => clearInterval(interval)
  }, [isPaused, activeIndex])

  // Center active card perfectly in the middle of the viewport (re-centers on resize / zoom out)
  useEffect(() => {
    const centerActiveCard = () => {
      if (!carouselRef.current) return
      const container = carouselRef.current
      const activeCardElement = container.children[activeIndex]
      if (activeCardElement) {
        const containerWidth = container.clientWidth
        const cardOffsetLeft = activeCardElement.offsetLeft
        const cardWidth = activeCardElement.clientWidth
        const targetScrollLeft = cardOffsetLeft - containerWidth / 2 + cardWidth / 2

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        })
      }
    }

    centerActiveCard()

    window.addEventListener('resize', centerActiveCard)
    return () => window.removeEventListener('resize', centerActiveCard)
  }, [activeIndex])

  return (
    <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full overflow-hidden py-6">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-3">
        <span className="text-brand font-bold text-xs tracking-wider uppercase">Target Audience</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
          Who is QR Se Print For?
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          If customers visit your shop for printouts, this will save 80% of your time and effort.
        </p>
      </div>

      {/* 3D PERSPECTIVE COVERFLOW STAGE */}
      <div
        ref={carouselRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar py-12 px-[calc(50%-130px)] sm:px-[calc(50%-150px)] scroll-smooth min-h-[380px]"
      >
        {audienceList.map((aud, idx) => {
          const Icon = aud.icon
          const isActive = activeIndex === idx
          const diff = idx - activeIndex

          // Calculate 3D rotation, scaling, and z-index based on distance from center
          let rotateY = 0
          let scale = 1.15
          let opacity = 1
          let blur = '0px'
          let zIndex = 40

          if (diff < 0) {
            // Left side cards: Tilted to the right 3D angle (tricha)
            rotateY = Math.min(38, Math.abs(diff) * 32)
            scale = Math.max(0.72, 1 - Math.abs(diff) * 0.18)
            opacity = Math.max(0.35, 1 - Math.abs(diff) * 0.3)
            blur = `${Math.min(4, Math.abs(diff) * 2)}px`
            zIndex = 30 - Math.abs(diff)
          } else if (diff > 0) {
            // Right side cards: Tilted to the left 3D angle (tricha)
            rotateY = -Math.min(38, Math.abs(diff) * 32)
            scale = Math.max(0.72, 1 - Math.abs(diff) * 0.18)
            opacity = Math.max(0.35, 1 - Math.abs(diff) * 0.3)
            blur = `${Math.min(4, Math.abs(diff) * 2)}px`
            zIndex = 30 - Math.abs(diff)
          }

          return (
            <motion.div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              animate={{
                rotateY: rotateY,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur})`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ zIndex: zIndex }}
              className={`w-[250px] sm:w-[290px] flex-shrink-0 p-6 rounded-3xl cursor-pointer flex flex-col gap-3.5 select-none transition-shadow ${
                isActive
                  ? 'bg-white border-2 border-brand shadow-2xl ring-4 ring-[#F0245C]/20'
                  : 'bg-white/90 border border-stone-200/80 shadow-md hover:border-stone-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                  isActive ? 'bg-brand text-white shadow-lg' : 'bg-rose-50 text-brand'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3
                className={`font-extrabold text-lg sm:text-xl font-heading transition-colors ${
                  isActive ? 'text-stone-900' : 'text-brand'
                }`}
              >
                {aud.title}
              </h3>

              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{aud.desc}</p>
            </motion.div>
          )
        })}
      </div>

      {/* BOTTOM CENTER CONTROLS: DOTS & NAVIGATION BUTTONS */}
      <div className="flex flex-col items-center gap-5 mt-2">
        
        {/* Active Dots Indicator */}
        <div className="flex items-center gap-2">
          {audienceList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-7 h-2.5 bg-brand rounded-full shadow-xs'
                  : 'w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400 rounded-full'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Center Bottom Navigation Arrow Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white border border-stone-200 hover:border-brand text-stone-700 hover:text-brand flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-brand hover:bg-[#D81B4E] text-white flex items-center justify-center shadow-lg shadow-[#F0245C]/30 hover:scale-105 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>

    </section>
  )
}
