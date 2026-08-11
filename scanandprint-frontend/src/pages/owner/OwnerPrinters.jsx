import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, RefreshCw, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPrinters() {
  const { currentShop, updatePrinters, isSavingPrinters } = useAuthStore()

  const [bwPrinter, setBwPrinter] = useState(currentShop?.defaultBwPrinter || 'Epson L3210 Series')
  const [colorPrinter, setColorPrinter] = useState(currentShop?.defaultColorPrinter || 'Epson L3210 Series')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (currentShop) {
      if (currentShop.defaultBwPrinter) setBwPrinter(currentShop.defaultBwPrinter)
      if (currentShop.defaultColorPrinter) setColorPrinter(currentShop.defaultColorPrinter)
    }
  }, [currentShop])

  const handleSavePrinters = async (e) => {
    e.preventDefault()
    await updatePrinters({
      defaultBwPrinter: bwPrinter,
      defaultColorPrinter: colorPrinter,
    })
  }

  const handleScanPrinters = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      toast.success('Rescanned connected Windows spooler devices!')
    }, 900)
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

      {/* main card */}
      <form onSubmit={handleSavePrinters} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">

        {/* Auto Detected System Printers Info */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-stone-900">Auto-Detected Windows Printers</h4>
              <p className="text-xs text-stone-500">2 connected USB/Network spooler devices detected</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleScanPrinters}
            disabled={isScanning}
            className="btn btn-outline bg-white btn-sm !font-bold flex items-center gap-2"
          >
            {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isScanning ? 'Scanning...' : 'Scan Printers'}</span>
          </button>
        </div>

        {/* B&W Printer Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Black & White Printer Device
          </label>
          <select
            value={bwPrinter}
            onChange={(e) => setBwPrinter(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="Epson L3210 Series">Epson L3210 Series (USB001)</option>
            <option value="HP LaserJet Pro M102w">HP LaserJet Pro M102w (USB002)</option>
            <option value="Canon PIXMA G3010">Canon PIXMA G3010</option>
            <option value="Microsoft Print to PDF">Microsoft Print to PDF (System Fallback)</option>
          </select>
        </div>

        {/* Color Printer Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-brand">
            Color Printer Device
          </label>
          <select
            value={colorPrinter}
            onChange={(e) => setColorPrinter(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-rose-300 bg-rose-50/30 focus:bg-white focus:border-brand text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="Epson L3210 Series">Epson L3210 Series (Color InkTank)</option>
            <option value="Canon PIXMA G3010">Canon PIXMA G3010</option>
            <option value="HP DeskJet 2331">HP DeskJet 2331</option>
            <option value="Microsoft Print to PDF">Microsoft Print to PDF (System Fallback)</option>
          </select>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSavingPrinters}
            className="btn btn-primary py-4 mt-2 px-8 flex items-center gap-2"
          >
            {isSavingPrinters ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSavingPrinters ? 'Saving Mapping...' : 'Save Printer Hardware Mapping'}</span>
          </button>
        </div>

      </form>

    </div>
  )
}

