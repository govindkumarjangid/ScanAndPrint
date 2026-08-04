import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

export const PRINTER_BRANDS = [
  'HP',
  'Epson',
  'Canon',
  'Brother',
  'Samsung',
  'Xerox',
  'Ricoh',
  'Panasonic',
  'Konica Minolta',
  'Kyocera',
  'Lexmark',
  'Dell',
  'Other',
]

export default function AnimatedDropdown({
  label,
  value,
  onChange,
  placeholder = '-- Brand select karo --',
  error,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          {label}
        </label>
      )}

      {/* Select trigger button */}
      <motion.button
        type="button"
        whileFocus={{ scale: 1.01 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 rounded-xl text-left flex items-center justify-between bg-white border transition-all cursor-pointer font-medium text-sm ${
          error
            ? 'border-rose-500 ring-2 ring-rose-200'
            : isOpen
            ? 'border-[#F0245C] ring-2 ring-[#F0245C]/20 shadow-sm'
            : 'border-stone-300 hover:border-stone-400'
        }`}
      >
        <span className={value ? 'text-stone-900 font-semibold' : 'text-stone-400'}>
          {value || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-stone-500" />
        </motion.div>
      </motion.button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 divide-y divide-stone-100"
          >
            {PRINTER_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  onChange(brand)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  value === brand
                    ? 'bg-[#F0245C]/10 text-[#F0245C] font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{brand}</span>
                {value === brand && <Check className="w-4 h-4 text-[#F0245C]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
    </div>
  )
}
