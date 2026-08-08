import React from 'react'
import { Printer } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-rose-500/25"
        >
          <Printer className="w-7 h-7 stroke-[2.2]" />
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-extrabold text-lg text-stone-900 font-heading">
            Scan<span className="text-brand">&Print</span>
          </span>
          <span className="text-xs font-semibold text-stone-500 animate-pulse">
            Loading page resources...
          </span>
        </div>
      </div>
    </div>
  )
}
