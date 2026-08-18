import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, RefreshCw, Sparkles, Loader2, CheckCircle2, AlertCircle, Laptop, Usb } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPrinters() {
  const { currentShop, fetchProfile, updatePrinters, isSavingPrinters } = useAuthStore()

  const connectedPrinters = currentShop?.connectedPrinters || []
  const isAgentOnline = currentShop?.isOnline ?? false

  const [bwPrinter, setBwPrinter] = useState(currentShop?.defaultBwPrinter || '')
  const [colorPrinter, setColorPrinter] = useState(currentShop?.defaultColorPrinter || '')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (currentShop) {
      if (currentShop.defaultBwPrinter) {
        setBwPrinter(currentShop.defaultBwPrinter)
      } else if (connectedPrinters.length > 0) {
        const defaultP = connectedPrinters.find((p) => p.isDefault) || connectedPrinters[0]
        setBwPrinter(defaultP.name)
      }

      if (currentShop.defaultColorPrinter) {
        setColorPrinter(currentShop.defaultColorPrinter)
      } else if (connectedPrinters.length > 0) {
        const defaultP = connectedPrinters.find((p) => p.isDefault) || connectedPrinters[0]
        setColorPrinter(defaultP.name)
      }
    }
  }, [currentShop])

  const handleSavePrinters = async (e) => {
    e.preventDefault()
    if (!bwPrinter && !colorPrinter) {
      toast.error('Please select at least one printer device')
      return
    }
    await updatePrinters({
      defaultBwPrinter: bwPrinter,
      defaultColorPrinter: colorPrinter,
    })
  }

  const handleScanPrinters = async () => {
    setIsScanning(true)
    try {
      const updatedShop = await fetchProfile()
      const newPrinters = updatedShop?.connectedPrinters || []
      if (newPrinters.length > 0) {
        toast.success(`Found ${newPrinters.length} connected printer(s) on your PC!`)
      } else {
        toast.success('Printer scan completed. Keep Desktop Print Agent running to sync live hardware.')
      }
    } catch (err) {
      toast.error('Failed to sync printers from agent')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Printer Setup & Hardware Mapping
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Map your Black & White and Color printers to route customer jobs automatically
        </p>
      </div>

      {/* Main Card */}
      <form onSubmit={handleSavePrinters} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">

        {/* Auto Detected System Printers Info Banner */}
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          connectedPrinters.length > 0
            ? 'bg-emerald-50/60 border-emerald-200/80'
            : isAgentOnline
            ? 'bg-amber-50/60 border-amber-200/80'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              connectedPrinters.length > 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-stone-200 text-stone-700'
            }`}>
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-stone-900">
                  {connectedPrinters.length > 0
                    ? `Auto-Detected Windows Printers (${connectedPrinters.length})`
                    : 'Windows Printers Detection'}
                </h4>
                {connectedPrinters.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Live Hardware Synced
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {connectedPrinters.length > 0
                  ? `${connectedPrinters.length} spooler device(s) reported by Desktop Agent on your PC`
                  : isAgentOnline
                  ? 'Desktop Agent is online. Scanning connected USB & WiFi printers...'
                  : 'Desktop Agent offline. Launch Scan&Print Agent on your PC to auto-detect USB printers.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleScanPrinters}
            disabled={isScanning}
            className="btn btn-outline bg-white btn-sm font-bold! flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-xs"
          >
            {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isScanning ? 'Scanning...' : 'Scan / Refresh Printers'}</span>
          </button>
        </div>

        {/* List of Connected Printers detected by Agent */}
        {connectedPrinters.length > 0 && (
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              Discovered Spooler Devices
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {connectedPrinters.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 shadow-2xs"
                >
                  <Usb className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate flex-1 font-mono">{p.name}</span>
                  {p.isDefault && (
                    <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-stone-200 shrink-0">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* B&W Printer Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center justify-between">
            <span>Black & White Printer Device</span>
            {bwPrinter && (
              <span className="text-stone-400 font-mono text-[11px] font-medium lowercase">
                selected: {bwPrinter}
              </span>
            )}
          </label>

          {connectedPrinters.length > 0 ? (
            <select
              value={bwPrinter}
              onChange={(e) => setBwPrinter(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none cursor-pointer"
            >
              <option value="">-- Select B&W Printer --</option>
              {connectedPrinters.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name} {p.isDefault ? '(Windows Default)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={bwPrinter}
                onChange={(e) => setBwPrinter(e.target.value)}
                placeholder="e.g. Epson L3210 Series, HP LaserJet M102w"
                className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none"
              />
            </div>
          )}
          <span className="text-[11px] text-stone-400 font-medium">
            Customer B&W documents will be sent to this printer.
          </span>
        </div>

        {/* Color Printer Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-brand flex items-center justify-between">
            <span>Color Printer Device</span>
            {colorPrinter && (
              <span className="text-rose-400 font-mono text-[11px] font-medium lowercase">
                selected: {colorPrinter}
              </span>
            )}
          </label>

          {connectedPrinters.length > 0 ? (
            <select
              value={colorPrinter}
              onChange={(e) => setColorPrinter(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-rose-300 bg-rose-50/30 focus:bg-white focus:border-brand text-sm font-semibold outline-none cursor-pointer"
            >
              <option value="">-- Select Color Printer --</option>
              {connectedPrinters.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name} {p.isDefault ? '(Windows Default)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={colorPrinter}
                onChange={(e) => setColorPrinter(e.target.value)}
                placeholder="e.g. Epson L3210 Series (Color InkTank), Canon G3010"
                className="w-full h-12 px-4 rounded-2xl border border-rose-300 bg-rose-50/30 focus:bg-white focus:border-brand text-sm font-semibold outline-none"
              />
            </div>
          )}
          <span className="text-[11px] text-stone-400 font-medium">
            Customer Color print jobs will be routed to this hardware.
          </span>
        </div>

        <div className="flex justify-start pt-2">
          <button
            type="submit"
            disabled={isSavingPrinters}
            className="btn btn-primary py-4 px-8 flex items-center gap-2 shadow-md"
          >
            {isSavingPrinters ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="text-shadow-xs">{isSavingPrinters ? 'Saving Hardware Mapping...' : 'Save Printer Hardware Mapping'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}

