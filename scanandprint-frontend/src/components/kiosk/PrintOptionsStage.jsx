import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PrintOptionsStage({
  shopInfo,
  colorType,
  setColorType,
  copies,
  setCopies,
  isDuplex,
  setIsDuplex,
  customerPhone,
  setCustomerPhone,
  totalPages,
  totalAmount,
  onBack,
  onProceedToPayment,
}) {
  const bwRate = shopInfo?.bwRate || 5
  const colorRate = shopInfo?.colorRate || 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-stone-900 font-heading">
          Configure Print Options
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change File</span>
        </button>
      </div>

      {/* Main Options Form */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md flex flex-col gap-5">
        {/* Color Type Switcher */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Print Output Color
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setColorType('BLACK_AND_WHITE')}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${colorType === 'BLACK_AND_WHITE'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                  : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                }`}
            >
              <span className="font-extrabold text-sm">Black & White</span>
              <span
                className={`text-xs ${colorType === 'BLACK_AND_WHITE' ? 'text-stone-300' : 'text-stone-500'
                  }`}
              >
                ₹{bwRate} per page
              </span>
            </button>

            <button
              type="button"
              onClick={() => setColorType('COLOR')}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${colorType === 'COLOR'
                  ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/25'
                  : 'bg-rose-50/50 text-stone-800 border-rose-200 hover:bg-rose-100/50'
                }`}
            >
              <span className="font-extrabold text-sm">Color Print</span>
              <span
                className={`text-xs ${colorType === 'COLOR' ? 'text-rose-100' : 'text-rose-600 font-semibold'
                  }`}
              >
                ₹{colorRate} per page
              </span>
            </button>
          </div>
        </div>

        {/* Number of Copies */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-stone-900">Copies Count</span>
            <span className="text-xs text-stone-500 font-medium">How many printed sets?</span>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="btn btn-ghost p-1 w-8 h-8 bg-stone-100! hover:bg-stone-200! text-stone-800 flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-base text-stone-900 w-6 text-center">
              {copies}
            </span>
            <button
              type="button"
              onClick={() => setCopies(copies + 1)}
              className="btn btn-ghost p-1 w-8 h-8 !bg-stone-100! hover:!bg-stone-200! text-stone-800 flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Duplex Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-stone-900">Double-Sided (Duplex)</span>
            <span className="text-xs text-stone-500 font-medium">Print on front & back</span>
          </div>
          <input
            type="checkbox"
            checked={isDuplex}
            onChange={(e) => setIsDuplex(e.target.checked)}
            className="w-5 h-5 accent-brand rounded cursor-pointer"
          />
        </div>

        {/* Customer Mobile Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-700">
            Mobile Number (For Receipt SMS)
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="98765 43210 (Optional)"
            className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none"
          />
        </div>

        {/* Price Calculation Card */}
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Calculation
            </span>
            <span className="text-xs text-stone-700 font-medium mt-0.5">
              {totalPages} Pages × {copies} Copy ({colorType === 'COLOR' ? 'Color' : 'B&W'})
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-brand font-heading">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Proceed to Pay Button */}
        <button
          type="button"
          onClick={onProceedToPayment}
          className="btn btn-primary py-4 shadow-lg w-full text-base font-bold flex items-center justify-center gap-2"
        >
          <span>Proceed to Pay ₹{totalAmount}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
