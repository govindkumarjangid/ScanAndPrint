import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Monitor,
} from 'lucide-react'

const setupSteps = [
  {
    step: 1,
    title: 'Register Your Shop',
    desc: 'Fill in your basic shop details (Name, Phone, Email, Password, and Printer Brand) in our 2-minute registration form.',
    icon: UserPlus,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 2,
    title: 'Download Print Agent Software',
    desc: 'Log in to your shop dashboard and download the lightweight Print Agent application for Windows.',
    icon: Download,
    badgeColor: 'bg-[#F0245C] text-white',
  },
  {
    step: 3,
    title: 'Map Your Printers (B&W / Color)',
    desc: 'The Print Agent automatically detects your connected Black & White and Color printers.',
    icon: Printer,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 4,
    title: 'Get Your Unique Shop QR Code',
    desc: 'Download and print your high-resolution customized QR code containing your unique Shop ID.',
    icon: QrCode,
    badgeColor: 'bg-[#F0245C] text-white',
  },
  {
    step: 5,
    title: 'Display the QR at Your Counter',
    desc: 'Place the printed QR code prominently at your counter, desk, or near your printing machines.',
    icon: Monitor,
    badgeColor: 'bg-amber-400 text-stone-900',
  },
  {
    step: 6,
    title: 'Start Receiving Auto-Print Orders!',
    desc: 'Customers scan the QR code from their mobile, make online payment, and pages automatically print out!',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-500 text-white',
  },
]

export default function HowToSetup() {
  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Step-by-Step Guide
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          How to Set Up QR Se Print?
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Automate your shop in just 6 simple steps. No technical expertise required!
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
                {/* Step circle */}
                <div className={`w-12 h-12 rounded-full ${s.badgeColor} flex items-center justify-center font-extrabold text-lg shadow-md shrink-0 z-10 group-hover:scale-110 transition-transform`}
                >
                  {s.step}
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all grow flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-brand" />
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
      <div className="max-w-3xl mx-auto w-full bg-linear-to-r from-amber-400 to-amber-500 rounded-3xl p-8 sm:p-10 text-stone-900 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-extrabold">Ready to Complete Step 1?</h3>
          <p className="text-stone-800 text-sm mt-1">Fill out the registration form now and get your QR code in 2 minutes.</p>
        </div>
        <Link to="/register" className="shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand hover:bg-brand-hover text-white font-extrabold px-8 py-4 rounded-full text-base shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>Start Step 1: Register</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
