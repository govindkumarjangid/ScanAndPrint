import React from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer, QrCode, Sparkles } from 'lucide-react'

export default function OwnerQrCode() {
  const shopCode = 'SHOP_98234'
  const shopName = 'Sharma Cyber Cafe'
  const kioskUrl = `https://qrprintpe.com/p/${shopCode}`

  const handlePrintPoster = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Printable Shop QR Code Poster
          </h1>
          <p className="text-stone-500 text-sm mt-0.5 font-medium">
            Place this QR Code poster at your shop counter for instant customer scanning & printing
          </p>
        </div>

        <button
          onClick={handlePrintPoster}
          className="btn-primary px-5 py-3 text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Poster / Download PDF</span>
        </button>
      </div>

      {/* Printable Poster Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl flex flex-col items-center text-center gap-8 max-w-md mx-auto print:shadow-none print:border-none print:w-full">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md">
            <Printer className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 leading-tight">
            {shopName}
          </h2>
          <span className="text-xs font-bold text-brand uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Automated Smart Printing Kiosk
          </span>
        </div>

        {/* High Res QR Code Card */}
        <div className="p-6 rounded-3xl bg-amber-400 border-4 border-amber-300 shadow-lg flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-inner">
            <QRCodeSVG value={kioskUrl} size={220} level="H" includeMargin />
          </div>
          <span className="text-stone-900 font-extrabold text-sm tracking-wide font-mono">
            SHOP ID: {shopCode}
          </span>
        </div>

        {/* How to Print Customer Instructions */}
        <div className="flex flex-col gap-2 text-stone-600 text-xs font-semibold max-w-xs">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-extrabold text-[11px] flex items-center justify-center">1</span>
            <span>Scan QR Code with Phone Camera</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-extrabold text-[11px] flex items-center justify-center">2</span>
            <span>Upload Document & Pay UPI Online</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-emerald-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">3</span>
            <span>Auto-Prints Instant Pages Here! ✨</span>
          </div>
        </div>

      </div>

    </div>
  )
}
