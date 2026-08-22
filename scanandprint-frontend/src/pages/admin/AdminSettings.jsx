import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Clock,
  Trash2,
  Phone,
  Mail,
  Megaphone,
  Sliders,
} from 'lucide-react'
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
    if (!settingsData.monthlyPrice || Number(settingsData.monthlyPrice) <= 0) {
      toast.error('Please enter a valid monthly price (min ₹1)')
      return
    }
    if (!settingsData.yearlyPrice || Number(settingsData.yearlyPrice) <= 0) {
      toast.error('Please enter a valid yearly price (min ₹1)')
      return
    }
    await saveSettings()
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Platform Settings & Super Admin Control
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Configure platform pricing plans, file auto-purge policies, support details, and broadcast notices
        </p>
      </div>

      {/* Main Settings Form */}
      {settingsLoading ? (
        <div className="bg-stone-950 rounded-3xl p-8 border border-stone-800 flex flex-col items-center justify-center gap-2 text-stone-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span>Loading settings...</span>
        </div>
      ) : (
      <form onSubmit={handleSaveSettings} className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6 shadow-sm">
        
        {/* 1. Subscription Plan Pricing */}
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span>Subscription Plan Pricing</span>
          </h3>
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
        </div>

        {/* 2. Free Demo & File Purge Policies */}
        <div className="pt-2 border-t border-stone-800/80">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Trial & Privacy Storage Policies</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Demo Duration (Hours)</span>
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={settingsData.demoDurationHours ?? 2}
                onChange={(e) => updateSetting('demoDurationHours', Number(e.target.value))}
                className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-stone-500">Default duration granted to newly registered shops</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF Auto-Purge Interval (Minutes)</span>
              </label>
              <input
                type="number"
                min="10"
                max="1440"
                value={settingsData.filePurgeMinutes ?? 60}
                onChange={(e) => updateSetting('filePurgeMinutes', Number(e.target.value))}
                className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-stone-500">Auto-delete customer PDF files after successful print</span>
            </div>
          </div>
        </div>

        {/* 3. Global Support Contact */}
        <div className="pt-2 border-t border-stone-800/80">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Platform Support Info</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Support WhatsApp / Mobile</span>
              </label>
              <input
                type="text"
                value={settingsData.supportPhone ?? '+91 98765 43210'}
                onChange={(e) => updateSetting('supportPhone', e.target.value)}
                className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Support Email</span>
              </label>
              <input
                type="email"
                value={settingsData.supportEmail ?? 'scanqrandprint@gmail.com'}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Global Broadcast Announcement */}
        <div className="pt-2 border-t border-stone-800/80 flex flex-col gap-2">
          <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Broadcast Notice (Shown to all shop owners)</span>
          </label>
          <textarea
            rows="2"
            value={settingsData.systemNotice ?? ''}
            onChange={(e) => updateSetting('systemNotice', e.target.value)}
            placeholder="e.g., Scheduled server maintenance on Sunday at 2:00 AM IST. All print services will resume shortly."
            className="w-full p-3 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-medium text-white outline-none placeholder:text-stone-600"
          />
        </div>

        {/* 5. Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800/80">
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-white">Maintenance Mode</span>
              <span className="text-xs text-stone-400">Pause new kiosks & job creation</span>
            </div>
            <input
              type="checkbox"
              checked={settingsData.maintenanceMode}
              onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
              className="w-5 h-5 accent-brand rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-extrabold text-white">Free Demo Mode</span>
              <span className="text-xs text-stone-400">Allow new shops to test free trial</span>
            </div>
            <input
              type="checkbox"
              checked={settingsData.demoMode}
              onChange={(e) => updateSetting('demoMode', e.target.checked)}
              className="w-5 h-5 accent-brand rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSavingSettings}
          className="btn btn-primary py-3.5 mt-2 w-full flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{isSavingSettings ? 'Saving Settings...' : 'Save Super Admin Settings'}</span>
        </button>

      </form>
      )}

    </div>
  )
}
