import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OwnerPricing() {
  const [bwRate, setBwRate] = useState(5)
  const [colorRate, setColorRate] = useState(10)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSavingRates, setIsSavingRates] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handleSaveRates = (e) => {
    e.preventDefault()
    setIsSavingRates(true)
    setTimeout(() => {
      setIsSavingRates(false)
      toast.success('Print rates updated successfully!')
    }, 800)
  }

  const handleUpdatePassword = (e) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    setTimeout(() => {
      setIsUpdatingPassword(false)
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 800)
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

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSavingRates}
            className="btn btn-primary py-4 mt-2 px-8"
          >
            {isSavingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingRates ? 'Saving...' : 'Save Customer Print Rates'}</span>
          </button>
        </div>

      </form>
      {/* Password Form */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">

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


        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="btn btn-primary py-4 mt-2 px-8"
          >
            {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
