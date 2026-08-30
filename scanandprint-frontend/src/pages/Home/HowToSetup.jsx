import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { motion, useScroll, useSpring } from 'framer-motion'
import SEO from '../../components/common/SEO'
import { ArrowRight, setupSteps } from '../../assets/assets'

export default function HowToSetup() {
  const stageRef = useRef(null)
  const badgeRefs = useRef([])
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [points, setPoints] = useState([])
  const [ready, setReady] = useState(false)

  const measure = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const stageRect = stage.getBoundingClientRect()
    const pts = badgeRefs.current.map((el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.left + r.width / 2 - stageRect.left,
        y: r.top + r.height / 2 - stageRect.top,
      }
    })
    if (pts.some((p) => !p)) return
    setDims({ width: stageRect.width, height: stageRect.height })
    setPoints(pts)
    setReady(true)
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    if (stageRef.current) ro.observe(stageRef.current)
    window.addEventListener('resize', measure)
    const t = setTimeout(measure, 250)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      clearTimeout(t)
    }
  }, [measure])

  const buildPath = () => {
    if (!ready || points.length === 0 || !dims.width) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      d += ` Q ${p1.x} ${my}, ${mx} ${my} T ${p2.x} ${p2.y}`
    }
    return d
  }

  const pathD = buildPath()

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start center', 'end center'],
  })

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  })

  return (
    <div className="flex flex-col gap-16 md:gap-24 py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <SEO path="/how-to-setup" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto flex items-center gap-1.5">
          Interactive Setup Tour
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          How to Set Up <span className="marker-highlight text-stone-900">Scan&Print</span>?
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Automate your shop in just 6 simple steps. Follow the curved wave timeline below!
        </p>
      </div>

      {/* wave*/}
      <div className="w-full relative py-6">
        <div ref={stageRef} className="hidden md:block relative w-full">
          <motion.svg
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0"
            viewBox={`0 0 ${dims.width || 1} ${dims.height || 1}`}
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <defs>
              <linearGradient id="archedSineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F0245C" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Base background wave */}
            <path
              d={pathD}
              fill="none"
              stroke="#E7E5E4"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#archedSineGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </motion.svg>

          <div className="flex flex-col gap-12 relative z-10 w-full">
            {setupSteps.map((s, idx) => {
              const Icon = s.icon
              const isLeftCard = s.isLeftCard

              const Card = (
                <motion.div
                  initial={{ opacity: 0, scale: 0, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.2, delay: idx * 0.1, stiffness: 30,
                    damping: 300,
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-sm hover:border-brand transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-brand flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-xl text-stone-900 font-heading">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400">
                    <span>Step 0{s.step}</span>
                    <span className="text-brand">Scan&Print</span>
                  </div>
                </motion.div>
              )

              return (
                <div
                  key={s.step}
                  className="grid grid-cols-[1fr_112px_1fr] items-center gap-x-6"
                >
                  {/* left slot */}
                  <div>{isLeftCard ? Card : null}</div>
                  <div
                    className={`flex ${isLeftCard ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      ref={(el) => (badgeRefs.current[idx] = el)}
                      className={`w-12 h-12 rounded-full ${s.badgeColor} flex items-center justify-center font-extrabold text-lg shrink-0 transition-transform hover:scale-110 cursor-default`}
                    >
                      {s.step}
                    </div>
                  </div>

                  {/* right slot */}
                  <div>{!isLeftCard ? Card : null}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* cards */}
        <div className="md:hidden flex flex-col gap-6">
          {setupSteps.map((s) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-brand flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-lg text-stone-900 font-heading">{s.title}</h3>
                  </div>
                  <span
                    className={`w-8 h-8 rounded-full ${s.badgeColor} font-extrabold text-xs flex items-center justify-center shrink-0`}
                  >
                    {s.step}
                  </span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            )
          })}
        </div>

      </div>

      {/* CTA buttons */}
      <div className="max-w-3xl mx-auto w-full bg-linear-to-r from-amber-400 to-amber-500 rounded-3xl p-8 sm:p-10 text-stone-900 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold font-heading">Ready to Complete Step 1?</h3>
          <p className="text-stone-800 text-sm mt-1">Fill out the registration form now and get your QR code in 2 minutes.</p>
        </div>
        <Link to="/register" className="shrink-0">
          <button
            className="btn btn-secondary btn-lg shadow-lg"
          >
            <span>Start Step 1: Register</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

    </div>
  )
}