import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, CheckCircle2, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerSettings() {
  const { currentShop, updateProfile, isSavingProfile } = useAuthStore()

  const [shopName, setShopName] = useState(currentShop?.shopName || 'Sharma Cyber Cafe')
  const [ownerName, setOwnerName] = useState(currentShop?.ownerName || 'Rahul Kumar')
  const [email, setEmail] = useState(currentShop?.email || 'rahul@sharmacyber.com')
  const [phone, setPhone] = useState(currentShop?.phone || '9876543210')
  const [address, setAddress] = useState(currentShop?.address || 'Main Market, Opposite Railway Station')

  useEffect(() => {
    if (currentShop) {
      if (currentShop.shopName) setShopName(currentShop.shopName)
      if (currentShop.ownerName) setOwnerName(currentShop.ownerName)
      if (currentShop.email) setEmail(currentShop.email)
      if (currentShop.phone) setPhone(currentShop.phone)
      if (currentShop.address) setAddress(currentShop.address)
    }
  }, [currentShop])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({
      shopName,
      ownerName,
      email,
      phone,
      address,
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Shop Profile & Settings
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Update your shop details, contact phone, and account credentials
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5">
        
        {/* Shop Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-700">Shop Name</label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* Owner Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-700">Owner Name</label>
          <input
            type="text"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-700">Mobile Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-700">Shop Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none transition-all"
          />
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn btn-primary py-4 mt-2 px-8 flex items-center gap-2"
          >
            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingProfile ? 'Saving Profile...' : 'Save Profile Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}

