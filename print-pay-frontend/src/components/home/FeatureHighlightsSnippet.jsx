import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { QrCode, Printer, ShieldCheck, ArrowRight } from 'lucide-react'

// Feature highlight snippets
const highlights = [
  {
    icon: QrCode,
    title: 'Scan → Upload → Pay → Auto Print',
    desc: 'Customers scan your counter QR code, upload files, and pay online — documents print automatically on your PC!',
  },
  {
    icon: Printer,
    title: 'No WiFi Printer Required',
    desc: 'Works seamlessly with your existing standard USB or desktop printer. No expensive hardware needed.',
  },
  {
    icon: ShieldCheck,
    title: 'Auto-Deleted Private Files',
    desc: 'Customer files are automatically deleted immediately after printing. 100% data privacy and trust.',
  },
]

export default function FeatureHighlightsSnippet() {
  return (
    <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Feature Highlights</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Why Choose QR Se Print?
            </h2>
          </div>
          <Link to="/features">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
            >
              <span>Explore All Features</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((h, i) => {
            const IconComponent = h.icon
            return (
              <div key={i} className="bg-stone-800/80 p-6 rounded-2xl border border-stone-700/60 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">{h.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{h.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
