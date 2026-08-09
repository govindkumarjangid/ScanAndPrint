import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Save } from 'lucide-react'

export default function OwnerPricing() {
  const [bwRate, setBwRate] = useState(5)
  const [colorRate, setColorRate] = useState(10)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveRates = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Print Rates & Customer Pricing
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Set your per-page customer printout charges for Black & White and Color pages
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Print rates updated! Customers scanning your QR code will see the new pricing.</span>
        </motion.div>
      )}

      {/* Rates Form */}
      <form onSubmit={handleSaveRates} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* B&W Rate */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Black & White Rate (₹ / page)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                required
                value={bwRate}
                onChange={(e) => setBwRate(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-xl border border-stone-300 bg-white text-lg font-extrabold text-stone-900 outline-none focus:border-brand"
              />
            </div>
            <span className="text-[11px] text-stone-500 font-medium">Standard B&W A4 Single-sided rate</span>
          </div>

          {/* Color Rate */}
          <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/80 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-brand">
              Color Rate (₹ / page)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-brand font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                required
                value={colorRate}
                onChange={(e) => setColorRate(Number(e.target.value))}
                className="w-full h-12 pl-8 pr-4 rounded-xl border border-rose-300 bg-white text-lg font-extrabold text-stone-900 outline-none focus:border-brand"
              />
            </div>
            <span className="text-[11px] text-rose-600 font-medium">Standard Color A4 Single-sided rate</span>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="btn-primary py-4 text-sm shadow-md mt-2 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Customer Print Rates</span>
        </motion.button>

      </form>
      {/* Password Form */}
      <form onSubmit="" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">

        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Current Password
          </label>
          <div className="relative flex items-center">
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full h-12 pl-4 pr-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-stone-50/60 p-5 rounded-2xl border border-stone-200/80 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full h-12 pl-4 pr-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full h-12 pl-4 pr-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>


        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="btn-primary py-4 text-sm shadow-md mt-2 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Update Password</span>
        </motion.button>

      </form>

    </div>
  )
}
