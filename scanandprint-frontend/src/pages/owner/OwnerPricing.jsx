import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Save, Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPricing() {
  const { currentShop, fetchProfile, updateRates, isSavingRates } = useAuthStore()

  const [bwRate, setBwRate] = useState(currentShop?.bwRate ?? 5)
  const [colorRate, setColorRate] = useState(currentShop?.colorRate ?? 10)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (currentShop) {
      if (currentShop.bwRate !== undefined) setBwRate(currentShop.bwRate)
      if (currentShop.colorRate !== undefined) setColorRate(currentShop.colorRate)
    }
  }, [currentShop])

  const handleSaveRates = async (e) => {
    e.preventDefault()
    await updateRates({ bwRate: Number(bwRate), colorRate: Number(colorRate) })
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Print Rates & Customer Pricing
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5 font-medium">
          Set your per-page customer printout charges for Black & White and Color pages
        </p>
      </div>

      {/* Rates Form */}
      <form onSubmit={handleSaveRates} className="bg-white rounded-3xl p-4 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-4 sm:gap-6 overflow-hidden">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {/* B&W Rate */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Black & White Rate (₹ / page)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={bwRate}
                onChange={(e) => setBwRate(e.target.value)}
                className="w-full h-11 sm:h-12 pl-8 pr-4 rounded-xl border border-stone-300 bg-white text-base sm:text-lg font-extrabold text-stone-900 outline-none focus:border-brand"
              />
            </div>
            <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">Standard B&W A4 Single-sided rate</span>
          </div>

          {/* Color Rate */}
          <div className="bg-rose-50/60 p-4 sm:p-5 rounded-2xl border border-rose-200/80 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-brand">
              Color Rate (₹ / page)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-brand font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={colorRate}
                onChange={(e) => setColorRate(e.target.value)}
                className="w-full h-11 sm:h-12 pl-8 pr-4 rounded-xl border border-rose-300 bg-white text-base sm:text-lg font-extrabold text-stone-900 outline-none focus:border-brand"
              />
            </div>
            <span className="text-[10px] sm:text-[11px] text-rose-600 font-medium">Standard Color A4 Single-sided rate</span>
          </div>
        </div>

        <div className="flex justify-start pt-1">
          <button
            type="submit"
            disabled={isSavingRates}
            className="btn btn-primary py-3.5 sm:py-4 px-6 sm:px-8 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base font-bold shadow-md cursor-pointer"
          >
            {isSavingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingRates ? 'Saving Rates...' : 'Save Customer Print Rates'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
