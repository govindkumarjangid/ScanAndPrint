import React from 'react'
import { Printer, CheckCircle2, AlertCircle } from 'lucide-react'

export default function KioskHeader({ shopInfo }) {
  const isOnline = shopInfo?.isOnline ?? true

  return (
    <header className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs backdrop-blur-md">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Printer className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-extrabold text-base sm:text-lg text-stone-900 leading-snug truncate">
              {shopInfo?.shopName || shopInfo?.name || 'Cyber Cafe & Prints'}
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 truncate">
              <span className="font-mono text-stone-700 font-bold uppercase">{shopInfo?.shopCode || shopInfo?.code || 'DEMO'}</span>
              <span>·</span>
              <span className="text-stone-700">₹{shopInfo?.bwRate || 5} B&W / ₹{shopInfo?.colorRate || 10} Color</span>
            </div>
          </div>
        </div>

        {/* Live Printer Connection Status Badge */}
        {isOnline ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRINTER READY</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>CLOUD QUEUE</span>
          </div>
        )}
      </div>
    </header>
  )
}
