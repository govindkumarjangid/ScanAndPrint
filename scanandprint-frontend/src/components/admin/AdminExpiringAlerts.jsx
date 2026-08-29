import React, { useState } from 'react'
import { AlertTriangle, Clock, Plus, Zap, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminExpiringAlerts({ expiringShops = [] }) {
  const { extendShopDemo, updateShopPlan } = useAdminStore()
  const [loadingId, setLoadingId] = useState(null)

  if (!expiringShops || expiringShops.length === 0) return null

  const handleExtend = async (shopId, hours) => {
    setLoadingId(`${shopId}-${hours}`)
    await extendShopDemo(shopId, hours)
    setLoadingId(null)
  }

  const handleUpgrade = async (shopId) => {
    setLoadingId(`${shopId}-upgrade`)
    await updateShopPlan(shopId, 'MONTHLY_299', 30, true)
    setLoadingId(null)
  }

  return (
    <div className="bg-amber-950/40 border border-amber-800/80 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">

      {/* Top Banner Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0 border border-amber-700/60">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-amber-200 uppercase tracking-wider">
                Action Required: {expiringShops.length} Shops Expiring in Next 48 Hours
              </h3>
              <span className="text-[10px] font-bold bg-amber-900/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700">
                Priority
              </span>
            </div>
            <p className="text-stone-300 text-xs mt-0.5">
              Extend free trial duration or upgrade subscriptions directly from this console
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Shops Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {expiringShops.map((s) => {
          const isBusy2h = loadingId === `${s.id}-2`
          const isBusy24h = loadingId === `${s.id}-24`
          const isBusyUpgrade = loadingId === `${s.id}-upgrade`

          const expDate = s.expiresAt ? new Date(s.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'

          return (
            <div
              key={s.id}
              className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{s.shopName}</h4>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                    <span className="font-mono text-stone-300">{s.shopCode}</span>
                    <span>·</span>
                    <span>{s.phone}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Exp: {expDate}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80">
                <button
                  onClick={() => handleExtend(s.id, 2)}
                  disabled={Boolean(loadingId)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-xs font-extrabold border border-amber-800/80 flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Extend Free Demo by +2 Hours"
                >
                  {isBusy2h ? <Loader2 className="w-3 h-3 animate-spin" /> : ""}
                  <span>+2 Hr</span>
                </button>

                <button
                  onClick={() => handleExtend(s.id, 24)}
                  disabled={Boolean(loadingId)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-extrabold border border-stone-800 flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Extend Free Demo by +24 Hours"
                >
                  {isBusy24h ? <Loader2 className="w-3 h-3 animate-spin" /> : ""}
                  <span>+24 Hr</span>
                </button>

                <button
                  onClick={() => handleUpgrade(s.id)}
                  disabled={Boolean(loadingId)}
                  className="py-1.5 px-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  title="Activate Full Paid Subscription"
                >
                  {isBusyUpgrade ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  <span>Grant Paid</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
