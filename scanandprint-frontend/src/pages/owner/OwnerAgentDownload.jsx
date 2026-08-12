import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Key, CheckCircle2, Copy, Monitor, ShieldCheck } from 'lucide-react'

export default function OwnerAgentDownload() {
  const shopCode = 'SHOP_98234'
  const secretKey = 'sec_live_a89f31d09x7b219e40f1'
  const [copiedKey, setCopiedKey] = useState(false)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Desktop Print Agent (.exe)
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Lightweight Windows background software that routes online customer print jobs to your local printers
        </p>
      </div>

      {/* Download Box */}
      <div className="bg-linear-to-br from-brand to-rose-600 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full w-max">
            Windows 10 / 11 Compatible
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Download Print Agent Setup v1.0.0
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm max-w-md leading-relaxed">
            Single 1-click Windows installer (~88MB). Runs silently in system tray next to the Windows clock.
          </p>
        </div>

        <a href="/downloads/QR_Se_Print_Agent_Setup_1.0.0.exe" download className="shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-secondary bg-white! text-brand! hover:bg-rose-50 p!x-8 py-4 shadow-lg text-base"
          >
            <Download className="w-5 h-5" />
            <span>Download .exe (88MB)</span>
          </motion.button>
        </a>
      </div>

      {/* Credentials Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-stone-100 pb-4">
          <h3 className="text-xl font-extrabold text-stone-900 font-heading">Your Agent Pairing Credentials</h3>
          <p className="text-xs text-stone-500 mt-0.5">Enter these two credentials when prompted by the desktop app on first launch</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Shop Code */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Shop ID Code</span>
            <span className="text-lg font-extrabold text-stone-900 font-mono">{shopCode}</span>
          </div>

          {/* Secret API Key */}
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Secret API Key</span>
              <button
                onClick={handleCopyKey}
                className="btn btn-ghost btn-sm text-brand! px-2! py-1!"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <span className="text-xs font-extrabold text-stone-900 font-mono truncate">{secretKey}</span>
          </div>
        </div>
      </div>

      {/* 4-Step Instructions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-4">
        <h3 className="text-lg font-extrabold text-stone-900 font-heading">Quick 4-Step Setup Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-stone-700">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0">1</span>
            <span>Download & Run <strong>QR_Se_Print_Agent_Setup_1.0.0.exe</strong></span>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0">2</span>
            <span>Input your <strong>Shop ID</strong> & <strong>Secret Key</strong> shown above</span>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0">3</span>
            <span>Select your Black & White and Color USB/Network Printers</span>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0">4</span>
            <span>App minimizes to System Tray 🟢 and auto-prints incoming orders!</span>
          </div>
        </div>
      </div>

    </div>
  )
}
