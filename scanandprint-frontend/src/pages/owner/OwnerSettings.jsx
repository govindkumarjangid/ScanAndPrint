import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, CheckCircle2, Save } from 'lucide-react'

export default function OwnerSettings() {
  const [shopName, setShopName] = useState('Sharma Cyber Cafe')
  const [ownerName, setOwnerName] = useState('Rahul Kumar')
  const [email, setEmail] = useState('rahul@sharmacyber.com')
  const [phone, setPhone] = useState('9876543210')
  const [address, setAddress] = useState('Main Market, Opposite Railway Station')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
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

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Shop settings updated successfully!</span>
        </motion.div>
      )}

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

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="btn-primary py-4 text-sm shadow-md mt-2 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Settings</span>
        </motion.button>

      </form>

    </div>
  )
}
