import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [monthlyPrice, setMonthlyPrice] = useState(399)
  const [lifetimePrice, setLifetimePrice] = useState(599)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveSettings = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          System Settings & Platform Configuration
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Configure platform pricing plans, system parameters, and maintenance modes
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950 border border-emerald-800 p-4 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>System settings updated successfully!</span>
        </motion.div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6">
        
        {/* Subscription Plan Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-300">Monthly Plan Price (₹ / mo)</label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-300">Lifetime Plan Price (₹ one-time)</label>
            <input
              type="number"
              value={lifetimePrice}
              onChange={(e) => setLifetimePrice(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
            />
          </div>
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-extrabold text-white">System Maintenance Mode</span>
            <span className="text-xs text-stone-400">Temporarily pause new customer kiosks and print job creation</span>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="w-5 h-5 accent-brand rounded cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary py-3.5 text-sm shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>

      </form>

    </div>
  )
}
