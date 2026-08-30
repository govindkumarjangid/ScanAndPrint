import { Link } from 'react-router'
import { motion } from 'framer-motion'
import SEO from '../../components/common/SEO'
import { ArrowRight, featuresList } from '../../assets/assets'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Features() {
  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-300 mx-auto w-full">
      <SEO path="/features" />
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Powerful Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Smart Features of <span className="marker-highlight text-stone-900">Scan&Print</span>
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Every feature is tailored specifically to empower Indian print shop owners and cyber cafés.
        </p>
      </div>

      {/* Grid Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {featuresList.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl text-stone-900">{f.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-brand bg-rose-50 px-3 py-1 rounded-md inline-block">
                  ✓ {f.highlight}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Bottom CTA */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl font-extrabold">Ready to Leverage These Features in Your Shop?</h2>
        <p className="text-stone-400 text-sm sm:text-base max-w-xl">
          Place a QR code on your counter and launch automated printing today!
        </p>
        <Link to="/register">
          <button
            className="btn btn-primary btn-lg"
          >
            <span>Register Your Shop Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
