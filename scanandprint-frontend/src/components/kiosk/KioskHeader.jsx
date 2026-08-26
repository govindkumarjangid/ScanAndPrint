import { MapPin } from 'lucide-react'
import { Link } from 'react-router'

export default function KioskHeader({ shopInfo }) {
  const isOnline = Boolean(shopInfo?.isOnline)
  const shopName = shopInfo?.shopName || shopInfo?.name || 'Scan&Print Smart Kiosk'
  const shopCode = shopInfo?.shopCode || shopInfo?.code || 'DEMO'
  const location = shopInfo?.address || shopInfo?.cityState || 'Local Print Shop'
  const bwRate = shopInfo?.bwRate ?? 5
  const colorRate = shopInfo?.colorRate ?? 10

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Shop Info with Original Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="shrink-0 group" title="Scan&Print">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img src="/svgs/logo.svg" alt="Scan&Print Logo" width="44" height="44" className="w-full h-full object-contain" />
            </div>
          </Link>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base text-stone-900 leading-snug truncate" title={shopName}>
                {shopName}
              </h1>
              <span className="font-mono text-[9.5px] sm:text-[10px] font-extrabold uppercase bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md shrink-0 border border-stone-200">
                {shopCode}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] font-semibold text-stone-500 mt-0.5 min-w-0">
              <span className="text-stone-800 font-bold whitespace-nowrap">₹{bwRate} B&W</span>
              <span className="text-stone-300">·</span>
              <span className="text-brand font-bold whitespace-nowrap">₹{colorRate} Color</span>
              {location && (
                <>
                  <span className="text-stone-300 hidden xs:inline">·</span>
                  <span className="truncate text-stone-500 hidden xs:flex items-center gap-0.5" title={location}>
                    <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                    {location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Hardware Connection Status */}
        <div className="shrink-0">
          {isOnline ? (
            <div
              title="Shop PC Agent is connected. Printouts will spool directly to printer."
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">PRINTER ONLINE</span>
              <span className="sm:hidden">ONLINE</span>
            </div>
          ) : (
            <div
              title="Shop PC Agent is offline. Job will be securely queued in cloud."
              className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="hidden sm:inline">CLOUD QUEUE</span>
              <span className="sm:hidden">QUEUED</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
