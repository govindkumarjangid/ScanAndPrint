import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from '../../assets/assets'

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleIndex = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className={`border rounded-2xl transition-all overflow-hidden ${
              isOpen
                ? 'border-[#F0245C]/40 bg-white shadow-md'
                : 'border-stone-200/80 bg-white/70 hover:border-stone-300 shadow-xs'
            }`}
          >
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-stone-900 text-base md:text-lg cursor-pointer"
            >
              <div className="flex items-center gap-3 pr-4">
                <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-[#F0245C]' : 'text-stone-400'}`} />
                <span>{item.question}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-[#F0245C]' : 'text-stone-400'}`} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-5 pt-1 text-stone-600 text-sm md:text-base leading-relaxed border-t border-stone-100">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
