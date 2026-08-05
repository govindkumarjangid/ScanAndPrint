import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function OriginStoryTeaser() {
  return (
    <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl p-8 sm:p-12 border border-amber-200/70 shadow-sm relative overflow-hidden"
      >
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider bg-amber-200/60 px-3 py-1 rounded-md w-max">
            Real Shop Owner Story
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            "Brother, I sent the file on WhatsApp, please print it!" — We were tired of hearing this every day.
          </h2>
          <p className="text-stone-700 leading-relaxed text-base sm:text-lg">
            While running a daily cyber café, over 50 customers would crowd the counter asking to print files via WhatsApp. From morning to evening, we spent hours scanning WhatsApp Web, downloading files, and collecting ₹5 payments. That daily frustration inspired <span className="font-bold text-[#F0245C]">QR Se Print</span> — built first for our own shop, and once our efficiency grew 10x, opened up for all shop owners nationwide!
          </p>

          <div className="pt-2">
            <Link to="/about" className="inline-flex items-center gap-2 text-[#F0245C] font-bold text-sm hover:underline">
              <span>Read Our Full Story (Origin Story)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
