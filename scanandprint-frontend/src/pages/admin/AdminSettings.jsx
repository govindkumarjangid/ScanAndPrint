import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { 
    settingsLoading, 
    isSavingSettings,
    settingsData, 
    fetchSettings, 
    updateSetting, 
    saveSettings 
  } = useAdminStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    await saveSettings()
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

      {/* Main Settings Form */}
      {settingsLoading ? (
        <div className="bg-stone-950 rounded-3xl p-8 border border-stone-800 flex flex-col items-center justify-center gap-2 text-stone-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      ) : (
      <form onSubmit={handleSaveSettings} className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6">
        
        {/* Subscription Plan Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-300">Monthly Plan Price (₹ / mo)</label>
            <input
              type="number"
              value={settingsData.monthlyPrice ?? 299}
              onChange={(e) => updateSetting('monthlyPrice', Number(e.target.value))}
              className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-300">Yearly Plan Price (₹ / year)</label>
            <input
              type="number"
              value={settingsData.yearlyPrice ?? 799}
              onChange={(e) => updateSetting('yearlyPrice', Number(e.target.value))}
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
            checked={settingsData.maintenanceMode}
            onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
            className="w-5 h-5 accent-brand rounded cursor-pointer"
          />
        </div>

        {/* Demo Mode Toggle */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-extrabold text-white">Free Demo Mode</span>
            <span className="text-xs text-stone-400">Allow users to take a free trial and demo the platform</span>
          </div>
          <input
            type="checkbox"
            checked={settingsData.demoMode}
            onChange={(e) => updateSetting('demoMode', e.target.checked)}
            className="w-5 h-5 accent-brand rounded cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSavingSettings}
          className="btn btn-primary py-3.5 mt-2 w-full flex items-center justify-center gap-2"
        >
          {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{isSavingSettings ? 'Saving Settings...' : 'Save System Settings'}</span>
        </button>

      </form>
      )}

    </div>
  )
}
