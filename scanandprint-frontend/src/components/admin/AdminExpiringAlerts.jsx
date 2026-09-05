import { useState, memo } from 'react'
import { AlertTriangle, Clock, Zap, Loader2, Phone } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import { formatDateTime } from '../../utils/dateUtil'
import AdminActionConfirmModal from './AdminActionConfirmModal'

function getRemainingTime(expiresAt) {
  if (!expiresAt) return 'Soon'
  try {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (isNaN(diff)) return 'Soon'
    if (diff <= 0) return 'Expired'
    const totalMinutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    if (hours < 1) return `${mins}m left`
    if (hours < 24) return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return remHours > 0 ? `${days}d ${remHours}h left` : `${days}d left`
  } catch {
    return 'Soon'
  }
}

function AdminExpiringAlerts({ expiringShops = [] }) {
  const { extendShopDemo, updateShopPlan } = useAdminStore()
  const [pendingAction, setPendingAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!expiringShops || expiringShops.length === 0) return null

  // Open confirmation modal for Demo Extension (24h or 7d)
  const requestExtend = (shop, hours) => {
    const is7Days = hours === 168
    setPendingAction({
      shop,
      actionType: is7Days ? 'demo_7d' : 'demo_24h',
      hours,
      title: is7Days ? 'Confirm 7 Days Demo Extension' : 'Confirm 24 Hours Demo Extension',
      badge: is7Days ? '+7 Days Free Demo' : '+24 Hours Free Demo',
      description: is7Days
        ? 'Extend free demo trial for 7 days (168 hours) from current expiry or now.'
        : 'Extend free demo trial for 24 hours from current expiry or now.',
      theme: 'amber',
      confirmLabel: is7Days ? 'Accept & Extend 7 Days' : 'Accept & Extend 24 Hours',
    })
  }

  // Open confirmation modal for Paid Plan Grant (1 Month / 30 Days)
  const requestUpgrade = (shop) => {
    setPendingAction({
      shop,
      actionType: 'paid_month',
      days: 30,
      title: 'Confirm Grant 1 Month Paid Plan',
      badge: '1 Month Full Subscription (30 Days)',
      description:
        'Activate full paid monthly subscription (30 days). Unlocks all premium features, unlimited printing, and full agent connectivity.',
      theme: 'brand',
      confirmLabel: 'Accept & Grant Plan',
    })
  }

  // Close modal safely
  const closeModal = () => {
    if (!isSubmitting) {
      setPendingAction(null)
    }
  }

  // Execute confirmed action
  const handleConfirm = async () => {
    if (!pendingAction) return
    setIsSubmitting(true)
    try {
      const { shop, actionType, hours, days } = pendingAction
      if (actionType === 'demo_24h' || actionType === 'demo_7d') {
        await extendShopDemo(shop.id, hours)
      } else if (actionType === 'paid_month') {
        await updateShopPlan(shop.id, 'MONTHLY_299', days || 30, true)
      }
      setPendingAction(null)
    } catch (err) {
      console.error('Confirmation action failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 shadow-sm relative overflow-hidden">
      {/* Top Banner Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0 border border-amber-700/60 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-200 uppercase tracking-wider">
                Action Required: {expiringShops.length} {expiringShops.length === 1 ? 'Shop' : 'Shops'} Expiring Soon
              </h3>
              <span className="text-[10px] font-bold bg-amber-900/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700 shrink-0">
                Priority
              </span>
            </div>
            <p className="text-stone-300 text-xs mt-0.5 leading-relaxed">
              Extend free trial duration or grant monthly subscriptions directly from this console
            </p>
          </div>
        </div>
      </div>

      {/* Expiring Shops Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
        {expiringShops.map((s) => {
          const timeLeft = getRemainingTime(s.expiresAt)
          const fullExpiryText = s.expiresAt ? formatDateTime(s.expiresAt) : 'Soon'
          const isTargetedInModal = pendingAction?.shop?.id === s.id && isSubmitting

          return (
            <div
              key={s.id}
              className="bg-stone-950/85 hover:bg-stone-950 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-stone-800/90 hover:border-amber-900/60 transition-all flex flex-col justify-between gap-3 shadow-xs min-w-0"
            >
              {/* Card Header Info */}
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  {/* Shop Name & Online Dot */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {s.isOnline !== undefined && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${s.isOnline ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-stone-600'
                          }`}
                        title={s.isOnline ? 'Printer Agent Online' : 'Printer Agent Offline'}
                      />
                    )}
                    <h4
                      className="text-xs sm:text-sm font-extrabold text-white truncate"
                      title={s.shopName}
                    >
                      {s.shopName}
                    </h4>
                  </div>

                  {/* Shop Code & Phone */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-400 mt-1">
                    <span className="font-mono text-stone-300 font-semibold bg-stone-900 px-1.5 py-0.5 rounded text-[11px] border border-stone-800">
                      {s.shopCode}
                    </span>
                    {s.phone ? (
                      <a
                        href={`tel:${s.phone}`}
                        className="inline-flex items-center gap-1 text-stone-300 hover:text-amber-400 transition-colors text-xs group"
                        title={`Call ${s.shopName} (${s.phone})`}
                      >
                        <Phone className="w-3 h-3 text-stone-400 group-hover:text-amber-400 transition-colors shrink-0" />
                        <span className="group-hover:underline">{s.phone}</span>
                      </a>
                    ) : (
                      <span className="text-stone-500 text-[11px] italic">No phone</span>
                    )}
                  </div>
                </div>

                {/* Expiry Pill */}
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/90 shrink-0 whitespace-nowrap self-start"
                  title={`Expires: ${fullExpiryText}`}
                >
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{timeLeft}</span>
                </span>
              </div>

              {/* Action Buttons: 24 Hr, 7 Days, Month */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => requestExtend(s, 24)}
                  disabled={isSubmitting}
                  className="py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-amber-950/80 hover:bg-amber-900 active:scale-95 text-amber-300 text-[11px] sm:text-xs font-bold border border-amber-800/80 flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-8 sm:min-h-8.5 whitespace-nowrap"
                  title="Extend Free Demo by +24 Hours (Requires Confirmation)"
                >
                  {isTargetedInModal && pendingAction?.actionType === 'demo_24h' ? (
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  ) : null}
                  <span>+24 Hr</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestExtend(s, 168)}
                  disabled={isSubmitting}
                  className="py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-200 text-[11px] sm:text-xs font-bold border border-stone-800 flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-8 sm:min-h-8.5 whitespace-nowrap"
                  title="Extend Free Demo by +7 Days (Requires Confirmation)"
                >
                  {isTargetedInModal && pendingAction?.actionType === 'demo_7d' ? (
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  ) : null}
                  <span>+7 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestUpgrade(s)}
                  disabled={isSubmitting}
                  className="py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl bg-brand hover:bg-brand-hover active:scale-95 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed min-h-8 sm:min-h-8.5 whitespace-nowrap"
                  title="Grant Full Paid Subscription for 1 Month (Requires Confirmation)"
                >
                  {isTargetedInModal && pendingAction?.actionType === 'paid_month' ? (
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  ) : (
                    <Zap className="w-3 h-3 shrink-0" />
                  )}
                  <span className="hidden xs:inline">Grant </span>
                  <span>Month</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reusable Action Confirmation Modal */}
      {pendingAction && (
        <AdminActionConfirmModal
          isOpen={Boolean(pendingAction)}
          onClose={closeModal}
          onConfirm={handleConfirm}
          shop={pendingAction.shop}
          actionTitle={pendingAction.title}
          actionBadge={pendingAction.badge}
          actionDescription={pendingAction.description}
          actionTheme={pendingAction.theme}
          confirmButtonLabel={pendingAction.confirmLabel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default memo(AdminExpiringAlerts)
