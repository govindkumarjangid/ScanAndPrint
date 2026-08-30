import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerAgentDownload() {
  const { currentShop, fetchProfile } = useAuthStore()

  useEffect(() => {
    if (!currentShop?.secretApiKey) {
      fetchProfile()
    }
  }, [currentShop, fetchProfile])

  const shopCode = currentShop?.shopCode || ''
  const secretKey = currentShop?.secretApiKey || ''

  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleCopyKey = () => {
    if (!secretKey) return
    navigator.clipboard.writeText(secretKey)
    setCopiedKey(true)
    toast.success('Secret API Key copied to clipboard!')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopyCode = () => {
    if (!shopCode) return
    navigator.clipboard.writeText(shopCode)
    setCopiedCode(true)
    toast.success('Shop ID Code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const downloadUrl =
    import.meta.env.VITE_AGENT_DOWNLOAD_URL ||
    'https://github.com/govindkumarjangid/ScanAndPrint/releases/download/v2.0.0/Scan.Print.Agent.Setup.2.0.0.exe'

  return (
    <div className="flex flex-col gap-6  w-full max-w-full overflow-hidden">

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
      <div className="bg-linear-to-br from-brand to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full w-max">
            Windows 10 / 11 Compatible
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Download Print Agent Setup v2.0.0
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm max-w-md leading-relaxed">
            Windows installer (~107MB). Automatically creates a Desktop Shortcut and runs silently in your Windows System Tray next to the clock.
          </p>
        </div>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          download="Scan_and_Print_Agent_Setup_2.0.0.exe"
          className="shrink-0 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-secondary bg-white! text-brand! hover:bg-rose-50! px-6 sm:px-8 py-3.5 sm:py-4 shadow-lg text-sm sm:text-base cursor-pointer w-full sm:w-auto justify-center"
          >
            <Download className="w-5 h-5" />
            <span>Download .exe (107MB)</span>
          </motion.button>
        </a>
      </div>

      {/* Credentials Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5 overflow-hidden">
        <div className="border-b border-stone-100 pb-4">
          <h3 className="text-xl font-extrabold text-stone-900 font-heading">Your Agent Pairing Credentials</h3>
          <p className="text-xs text-stone-500 mt-0.5">Enter these two credentials when prompted by the desktop app on first launch</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Shop Code */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col gap-2 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Shop ID Code</span>
              {shopCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="btn btn-ghost btn-sm text-stone-700 hover:text-stone-900! px-2! py-1! text-xs font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
            {shopCode ? (
              <span className="text-lg font-extrabold text-stone-900 font-mono tracking-wide select-all truncate">{shopCode}</span>
            ) : (
              <div className="flex items-center gap-2 text-stone-400 py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Fetching Shop ID...</span>
              </div>
            )}
          </div>

          {/* Secret API Key */}
          <div className="bg-rose-50/60 p-4 sm:p-5 rounded-2xl border border-rose-200/80 flex flex-col gap-2 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Secret API Key</span>
              <div className="flex items-center gap-1">
                {secretKey && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="p-1 rounded-lg hover:bg-rose-100/80 text-rose-700 transition-colors"
                      title={showSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="btn btn-ghost btn-sm text-brand! px-2! py-1! text-xs font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            {secretKey ? (
              <span className="text-sm font-extrabold text-stone-900 font-mono truncate select-all">
                {showSecret ? secretKey : '••••••••••••••••••••••••••••••••'}
              </span>
            ) : (
              <div className="flex items-center gap-2 text-stone-400 py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Fetching Secret Key...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-Step Instructions */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-4 overflow-hidden">
        <h3 className="text-lg font-extrabold text-stone-900 font-heading">Quick Setup & Launch Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-semibold text-stone-700">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 min-w-0 overflow-hidden">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">1</span>
            <span className="min-w-0 flex-1 wrap-break-words">
              Download & Run <strong className="font-bold text-stone-900 font-mono break-all inline-block">Scan_and_Print_Agent_Setup_2.0.0.exe</strong>
            </span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 min-w-0 overflow-hidden">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">2</span>
            <span className="min-w-0 flex-1 wrap-break-words">Input your <strong>Shop ID</strong> & <strong>Secret Key</strong> shown above</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 min-w-0 overflow-hidden">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">3</span>
            <span className="min-w-0 flex-1 wrap-break-words">Select your Black & White and Color USB/Network Printers</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 min-w-0 overflow-hidden">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">4</span>
            <span className="min-w-0 flex-1 wrap-break-words">📌 <strong>Desktop Shortcut is created automatically</strong>, and agent runs in system tray 🟢!</span>
          </div>
        </div>
      </div>

    </div>
  )
}
