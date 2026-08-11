import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Store,
  Printer,
  Clock,
  ShieldCheck,
  X,
  Zap,
  ArrowRight,
  testimonialData,
} from '../../assets/assets'
import TestimonialCard from './TestimonialCard'
import { Link } from 'react-router'
import api from '../../lib/axios'

// Convert a live DB review to the testimonialCard shape
const mapLiveReview = (r, index) => ({
  id: `live-${r.id || index}`,
  name: r.username || 'Shop Owner',
  shopName: r.shopName || 'Print Shop',
  location: r.cityState || 'India',
  rating: r.stars || 5,
  feedback: r.review || '',
  isLive: true,
  // Avatar initials from name
  avatar: (r.username || 'SO').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
  avatarBg: 'from-rose-500 to-amber-500',
})

export default function Testimonials() {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [allReviews, setAllReviews] = useState(testimonialData)

  // Fetch live reviews from backend and prepend to static ones
  useEffect(() => {
    const fetchLiveReviews = async () => {
      try {
        const res = await api.get('/auth/reviews')
        if (res.data.success && Array.isArray(res.data.data?.reviews) && res.data.data.reviews.length > 0) {
          const liveCards = res.data.data.reviews.map(mapLiveReview)
          setAllReviews([...liveCards, ...testimonialData])
        }
      } catch (e) {
        // silently fallback to static data
      }
    }
    fetchLiveReviews()
  }, [])

  const checkScrollability = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    const cardWidth = window.innerWidth < 640 ? 300 : 360
    const currentIndex = Math.round(scrollLeft / cardWidth)
    setActiveIndex(Math.min(allReviews.length - 1, Math.max(0, currentIndex)))
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScrollability()
    el.addEventListener('scroll', checkScrollability, { passive: true })
    window.addEventListener('resize', checkScrollability)
    return () => {
      el.removeEventListener('scroll', checkScrollability)
      window.removeEventListener('resize', checkScrollability)
    }
  }, [allReviews])

  // Auto-scroll
  useEffect(() => {
    if (isPaused || selectedReview) return
    const timer = setInterval(() => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const scrollAmount = window.innerWidth < 640 ? 310 : 360
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused, selectedReview])


  const scroll = (direction) => {
    if (!scrollRef.current) return
    const scrollAmount = window.innerWidth < 640 ? 300 : 360
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }


  const scrollToIndex = (index) => {
    if (!scrollRef.current) return
    const cardWidth = window.innerWidth < 640 ? 300 : 360
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    })
  }

  return (
    <section className="px-4 sm:px-6 max-w-300 mx-auto w-full py-6 sm:py-8 overflow-hidden relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-brand text-xs font-bold w-max shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand fill-brand" />
            <span>Trusted by 1,200+ Shop Owners</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Hear from India's <span className="marker-highlight text-stone-900">Top Print Shop</span> Owners
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            See how Xerox and Cyber Café businesses are saving 3+ hours every day, eliminating counter queues, and
            doubling daily automated revenue.
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
          {/* Overall Rating Pill */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">4.9/5</span>
            <span className="text-stone-400 text-[11px] hidden xs:inline">(350+)</span>
          </div>

          {/* Scroll Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`btn p-3! rounded-full! border transition-all ${canScrollLeft
                ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900'
                : 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed opacity-50'
                }`}
              aria-label="Scroll left testimonials"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`btn p-3! rounded-full! border transition-all ${canScrollRight
                ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900'
                : 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed opacity-50'
                }`}
              aria-label="Scroll right testimonials"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-linear-to-r from-brand-bg via-brand-bg/85 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-linear-to-l rom-brand-bg via-brand-bg/85 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-3.5 sm:gap-4.5 overflow-x-auto no-scrollbar py-3 sm:py-4 px-1 sm:px-2 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {allReviews.map((item) => (
            <TestimonialCard
              key={item.id}
              item={item}
              onSelect={(review) => setSelectedReview(review)}
            />
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
        {allReviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`transition-all duration-300 cursor-pointer ${activeIndex === idx
              ? 'w-6 sm:w-7 h-2 sm:h-2.5 bg-brand rounded-full shadow-xs'
              : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-stone-300 hover:bg-stone-400 rounded-full'
              }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>

      {/* popup model */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReview(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-120 bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 z-10 flex flex-col gap-3.5 sm:gap-4 my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Top Row: Stars + Growth Pill + Close Button */}
              <div className="flex items-center justify-between gap-2 pr-8">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                  <div className="flex items-center text-amber-400">
                    {[...Array(selectedReview.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800">5.0</span>
                </div>

                {selectedReview.growth && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedReview.growth}
                  </span>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedReview(null)}
                  className="absolute top-4 right-4 btn btn-ghost p-2 bg-stone-100 hover:bg-stone-200 text-stone-600"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Highlight Tag */}
              {selectedReview.highlight && (
                <div className="bg-stone-900 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span className="truncate">{selectedReview.highlight}</span>
                  </div>
                  {selectedReview.tag && (
                    <span className="text-[10px] uppercase font-semibold text-amber-400 bg-white/10 px-1.5 py-0.5 rounded ml-2 shrink-0">
                      {selectedReview.tag}
                    </span>
                  )}
                </div>
              )}

              {/* Full Testimonial Text  */}
              <div className="relative py-1">
                <Quote className="w-6 h-6 text-amber-300/40 absolute -top-2 -left-1 z-0 pointer-events-none" />
                <p className="text-stone-800 text-xs sm:text-[14px] leading-relaxed font-normal relative z-10 pl-2">
                  "{selectedReview.feedback}"
                </p>
              </div>

              {/* Hardware & Setup Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {selectedReview.printerUsed && (
                  <div className="flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 font-semibold">
                    <Printer className="w-3 h-3 text-brand" />
                    <span>{selectedReview.printerUsed}</span>
                  </div>
                )}
                {selectedReview.setupTime && (
                  <div className="flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 font-semibold">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{selectedReview.setupTime}</span>
                  </div>
                )}
                {selectedReview.isLive ? (
                  <div className="flex items-center gap-1 bg-rose-50 text-brand px-2 py-0.5 rounded-md border border-rose-200 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-brand" />
                    <span>Real Shop Owner Review</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Partner</span>
                  </div>
                )}
              </div>

              {/* Owner Profile Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-linear-to-tr ${selectedReview.avatarBg || 'from-amber-500 to-rose-500'
                      } text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0`}
                  >
                    {selectedReview.avatar || 'SO'}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                        {selectedReview.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                    </div>
                    <span className="text-[11px] text-brand font-semibold truncate flex items-center gap-1">
                      <Store className="w-2.5 h-2.5 shrink-0" />
                      {selectedReview.shopName}
                    </span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                      {selectedReview.location}
                    </span>
                  </div>
                </div>

                {/* Print Volume */}
                {selectedReview.stats && (
                  <div className="text-right flex flex-col shrink-0">
                    <span className="text-[8px] text-stone-400 font-semibold uppercase">Volume</span>
                    <span className="text-[11px] font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      {selectedReview.stats}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="btn btn-ghost btn-sm text-stone-600 hover:text-stone-900"
                >
                  Close
                </button>
                <Link
                  to="/register"
                  onClick={() => setSelectedReview(null)}
                  className="btn btn-primary px-4 py-2 text-xs"
                >
                  <span>Register Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
