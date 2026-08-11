import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Save, Loader2, KeyRound } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPricing() {
  const { currentShop, updateRates, changePassword, isSavingRates, isUpdatingPassword } = useAuthStore()

  const [bwRate, setBwRate] = useState(currentShop?.bwRate ?? 5)
  const [colorRate, setColorRate] = useState(currentShop?.colorRate ?? 10)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    const success = await changePassword(currentPassword, newPassword)
    if (success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
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
                min="0.5"
                step="0.5"
                required
                value={bwRate}
                onChange={(e) => setBwRate(e.target.value)}
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
                step="0.5"
                required
                value={colorRate}
                onChange={(e) => setColorRate(e.target.value)}
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
            className="btn btn-primary py-4 mt-2 px-8 flex items-center gap-2"
          >
            {isSavingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingRates ? 'Saving Rates...' : 'Save Customer Print Rates'}</span>
          </button>
        </div>

      </form>
      {/* Password Form */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-extrabold text-stone-900 font-heading">Change Account Password</h3>
          <p className="text-xs text-stone-500 mt-0.5">Keep your shop dashboard and agent credentials secure</p>
        </div>

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
              placeholder="Enter current password"
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
                placeholder="New password (min 6 chars)"
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
                placeholder="Confirm new password"
                className="w-full h-12 pl-4 pr-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>


        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="btn btn-outline py-4 mt-2 px-8 flex items-center gap-2"
          >
            {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <KeyRound className="w-4 h-4 text-brand" />}
            <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}
