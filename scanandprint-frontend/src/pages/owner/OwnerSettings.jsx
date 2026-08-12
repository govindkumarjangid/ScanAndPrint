import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, CheckCircle2, Save, Loader2, Lock, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerSettings() {
  const { currentShop, fetchProfile, updateProfile, changePassword, isSavingProfile, isUpdatingPassword } = useAuthStore()

  const [shopName, setShopName] = useState(currentShop?.shopName || '')
  const [ownerName, setOwnerName] = useState(currentShop?.ownerName || '')
  const [email, setEmail] = useState(currentShop?.email || '')
  const [phone, setPhone] = useState(currentShop?.phone || '')
  const [address, setAddress] = useState(currentShop?.address || '')
  const [cityState, setCityState] = useState(currentShop?.cityState || '')
  const [pincode, setPincode] = useState(currentShop?.pincode || '')

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (currentShop) {
      if (currentShop.shopName) setShopName(currentShop.shopName)
      if (currentShop.ownerName) setOwnerName(currentShop.ownerName)
      if (currentShop.email) setEmail(currentShop.email)
      if (currentShop.phone) setPhone(currentShop.phone)
      if (currentShop.address) setAddress(currentShop.address)
      if (currentShop.cityState) setCityState(currentShop.cityState)
      if (currentShop.pincode) setPincode(currentShop.pincode)
    }
  }, [currentShop])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({
      shopName,
      ownerName,
      address,
      cityState,
      pincode,
    })
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
    <div className="flex flex-col gap-8 max-w-3xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Shop Profile & Account Settings
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Update your shop information and manage your account security credentials
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-stone-900 font-heading">Shop Profile Details</h3>
          <span className="text-xs font-bold text-stone-400">Public & Receipt Info</span>
        </div>

        {/* Shop Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">Shop Name *</label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Sharma Cyber Cafe & Xerox"
            className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* Owner Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">Owner Full Name *</label>
          <input
            type="text"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* Locked Phone & Email Grid (Non-editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Locked Mobile */}
          <div className="flex flex-col gap-1.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600">Registered Mobile</label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
            <input
              type="tel"
              disabled
              value={phone}
              className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 font-mono text-sm font-bold outline-none cursor-not-allowed select-all"
            />
            <span className="text-[10px] text-stone-400 font-medium">Primary registered contact number</span>
          </div>

          {/* Locked Email */}
          <div className="flex flex-col gap-1.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600">Registered Gmail / Email</label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 font-mono text-sm font-bold outline-none cursor-not-allowed select-all"
            />
            <span className="text-[10px] text-stone-400 font-medium">Account login & notification email</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">Shop Address *</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop address, shop number, road/landmark"
            className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* City & Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">City, State</label>
            <input
              type="text"
              value={cityState}
              onChange={(e) => setCityState(e.target.value)}
              placeholder="e.g. Jaipur, Rajasthan"
              className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 302001"
              className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-start pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn btn-primary py-4 px-8 flex items-center gap-2 shadow-md"
          >
            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="text-shadow-xs">{isSavingProfile ? 'Saving Profile...' : 'Save Profile Details'}</span>
          </button>
        </div>

      </form>

      {/* Password Update Form Section (Shifted to Settings Page) */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-stone-900 font-heading">Account Password</h3>
            <p className="text-xs text-stone-500 mt-0.5">Change your shop login password securely</p>
          </div>
          <div className="p-2 rounded-xl bg-stone-100 text-stone-600">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        {/* Current Password */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Current Password *
          </label>
          <div className="relative flex items-center">
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* New & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-stone-50/60 p-5 rounded-2xl border border-stone-200/80 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              New Password *
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Confirm New Password *
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-start pt-1">
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="btn btn-outline py-4 px-8 flex items-center gap-2 font-bold"
          >
            {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <Lock className="w-4 h-4 text-brand" />}
            <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}

