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
    desc: 'Customer counter ka QR scan karta hai, file upload karta hai, pay karta hai aur print automatic nikal aata hai.',
    highlight: 'Scan → Upload → Pay → Auto Print',
  },
  {
    icon: Printer,
    title: 'Any Printer Supported',
    desc: 'Purana USB printer ho ya naya, koi mehanga WiFi printer lene ki zaroorat nahi. Sabhi normal printers supported hain.',
    highlight: 'No WiFi printer required',
  },
  {
    icon: Download,
    title: 'Easy Software Installation',
    desc: '2-step setup process. Windows PC par bas software install karo aur shop login ID daal kar start karo.',
    highlight: '2-min setup',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Document Processing',
    desc: 'Customer ki file system se print hote hi turant permanently delete ho jaati hai. 100% data privacy guarantee.',
    highlight: 'Auto-deleted after printing',
  },
  {
    icon: LayoutDashboard,
    title: 'Shop Owner Dashboard',
    desc: 'Apne mobile ya laptop se kabhi bhi total orders, today income aur active printer status track karein.',
    highlight: 'Real-time analytics',
  },
  {
    icon: SlidersHorizontal,
    title: 'Separate B&W & Color Printer',
    desc: 'B&W documents ke liye alag printer aur Color printouts ke liye alag printer easy drop-down se select karein.',
    highlight: 'Custom rate per page',
  },
  {
    icon: TrendingUp,
    title: 'Order & Income Management',
    desc: 'Daily earnings breakdown, payment history aur instant online settlement setup apne hisab se karein.',
    highlight: 'Transparent tracking',
  },
  {
    icon: Zap,
    title: 'Super Fast Performance',
    desc: 'Lightweight software bina PC ko slow kiye background mein fast print job trigger karta hai.',
    highlight: 'Zero PC lag',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates & Improvements',
    desc: 'Naye features aur security updates aapko automated software updates ke roop mein milte rahenge.',
    highlight: 'Lifetime improvements',
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
          QR Se Print Ke Smart Features
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Har feature Indian shop owners aur cyber cafes ki zaroorat ko dhyan mein rakh kar design kiya gaya hai.
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
        <h2 className="text-3xl font-extrabold">In Saare Features Ka Fayda Uthane Ke Liye Ready Hain?</h2>
        <p className="text-stone-400 text-sm sm:text-base max-w-xl">
          Apni dukan ke counter par QR lagaiye aur aaj se hi automatic printing start karein!
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
