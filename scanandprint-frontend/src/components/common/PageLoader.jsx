import React from 'react'
import { motion } from 'framer-motion'

export default function PageLoader({ message = 'Loading resources...', subtitle }) {
  return (
    <div className="min-h-screen bg-stone-50/90 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-white border border-rose-200/90 p-3 shadow-xl shadow-rose-500/15 flex items-center justify-center relative overflow-hidden"
        >
          <img
            src="/svgs/logo.svg"
            alt="Scan&Print Brand Logo"
            width="48"
            height="48"
            className="w-full h-full object-contain"
          />
        </motion.div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="font-extrabold text-xl text-stone-900 font-heading tracking-tight">
            Scan<span className="text-brand">&Print</span>
          </span>
          <span className="text-xs font-semibold text-stone-400 animate-pulse">
            {message}
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-stone-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


