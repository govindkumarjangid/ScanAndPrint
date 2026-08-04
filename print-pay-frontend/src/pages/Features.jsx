import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  QrCode,
  Printer,
  Download,
  ShieldCheck,
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
  Zap,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'

const featuresList = [
  {
    icon: QrCode,
    title: 'QR-Based Smart Printing',
    desc: 'Customers scan your counter QR code, upload files, complete payment, and documents print automatically.',
    highlight: 'Scan → Upload → Pay → Auto Print',
  },
  {
    icon: Printer,
    title: 'Any Printer Supported',
    desc: 'Compatible with all standard USB desktop printers. No expensive WiFi or smart printers required.',
    highlight: 'No WiFi Printer Needed',
  },
  {
    icon: Download,
    title: 'Easy Software Installation',
    desc: 'Simple 2-step setup. Install the lightweight Windows application and log in with your Shop ID.',
    highlight: '2-Minute Setup',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Document Processing',
    desc: 'Customer files are permanently auto-deleted from the system right after printing. 100% privacy guaranteed.',
    highlight: 'Auto-Deleted After Printing',
  },
  {
    icon: LayoutDashboard,
    title: 'Shop Owner Dashboard',
    desc: 'Track total print orders, daily revenue, and active printer status anytime from mobile or desktop.',
    highlight: 'Real-Time Analytics',
  },
  {
    icon: SlidersHorizontal,
    title: 'Separate B&W & Color Printers',
    desc: 'Configure separate default printers for Black & White and Color jobs with custom rates per page.',
    highlight: 'Custom Per-Page Rates',
  },
  {
    icon: TrendingUp,
    title: 'Order & Revenue Management',
    desc: 'Comprehensive earnings breakdown, transaction history, and direct payment gateway settlements.',
    highlight: 'Transparent Tracking',
  },
  {
    icon: Zap,
    title: 'Super Fast Performance',
    desc: 'Lightweight background application ensures zero PC lag while processing background print jobs.',
    highlight: 'Zero PC Lag',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates & Enhancements',
    desc: 'Receive automated software updates with new features, speed optimizations, and security patches.',
    highlight: 'Lifetime Updates',
  },
]

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
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-[#F0245C] font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Powerful Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Smart Features of QR Se Print
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Every feature is tailored specifically to empower Indian print shop owners and cyber cafés.
        </p>
      </div>

      {/* Grid of 9 Cards */}
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
                <div className="w-12 h-12 rounded-2xl bg-[#F0245C]/10 text-[#F0245C] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl text-stone-900">{f.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-[#F0245C] bg-rose-50 px-3 py-1 rounded-md inline-block">
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
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="bg-[#F0245C] hover:bg-[#D81B4E] text-white px-8 py-3.5 rounded-full font-bold text-base shadow-lg flex items-center gap-2"
          >
            <span>Register Your Shop Now</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
