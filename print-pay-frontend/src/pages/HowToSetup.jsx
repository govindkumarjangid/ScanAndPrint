import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Download,
  Printer,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Laptop,
} from 'lucide-react'

const setupSteps = [
  {
    step: 1,
    title: 'Register Your Shop',
    desc: 'Apni shop ki basic details (Naam, Phone, Email, Password aur Printer Brand) ke sath form bharo.',
    icon: UserPlus,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 2,
    title: 'Download the Print Agent Software',
    desc: 'Shop login ke baad windows PC ke liye small lightweight Print Agent zip file download karo.',
    icon: Download,
    badgeColor: 'bg-[#F0245C] text-white',
  },
  {
    step: 3,
    title: 'Map Your Printers (B&W / Color)',
    desc: 'Print agent software mein apna Black & White aur Color printer auto-detect hokar map ho jata hai.',
    icon: Printer,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 4,
    title: 'Get Your Unique Shop QR Code',
    desc: 'Aapko shop Dashboard se high quality PDF printable QR code milega aapki shop ID ke sath.',
    icon: QrCode,
    badgeColor: 'bg-[#F0245C] text-white',
  },
  {
    step: 5,
    title: 'Stick the QR at Your Counter',
    desc: 'QR code print karke shop counter, table ya xerox machine ke paas laga do.',
    icon: Monitor,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 6,
    title: 'Start Receiving Auto-Print Orders!',
    desc: 'Customer phone se QR scan karke pay karega aur paper automatically printer se print nikal aayega.',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-500 text-white',
  },
]

export default function HowToSetup() {
  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-[#F0245C] font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Step-by-Step Guide
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          QR Se Print Setup Kaise Karein?
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Kewal 6 aasan steps mein apni shop ko automated banayein. Kisi technical knowledge ki zaroorat nahi!
        </p>
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="max-w-3xl mx-auto w-full relative pl-6 sm:pl-10">
        {/* Timeline Line */}
        <div className="absolute top-6 bottom-6 left-6 sm:left-10 w-1 bg-stone-200 -ml-0.5 rounded-full" />

        <div className="flex flex-col gap-10">
          {setupSteps.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative flex items-start gap-6 group"
              >
                {/* Step badge circle */}
                <div
                  className={`w-12 h-12 rounded-full ${s.badgeColor} flex items-center justify-center font-extrabold text-lg shadow-md flex-shrink-0 z-10 group-hover:scale-110 transition-transform`}
                >
                  {s.step}
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex-grow flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-[#F0245C]" />
                    <h3 className="font-extrabold text-xl text-stone-900">{s.title}</h3>
                  </div>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">{s.desc}</p>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA Box */}
      <div className="max-w-3xl mx-auto w-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-8 sm:p-10 text-stone-900 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold">Taiyar hain Step 1 shuru karne ke liye?</h3>
          <p className="text-stone-800 text-sm mt-1">Abhi form bhariye aur 2 minute mein QR code paayein.</p>
        </div>
        <Link to="/register" className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#F0245C] hover:bg-[#D81B4E] text-white font-extrabold px-8 py-4 rounded-full text-base shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>Start Step 1: Register</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
