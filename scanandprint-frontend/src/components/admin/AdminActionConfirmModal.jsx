import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Clock,
  Zap,
  Loader2,
  Store,
  Calendar,
  Phone,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import { formatDateTime } from '../../utils/dateUtil'

function AdminActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  shop,
  actionTitle = 'Confirm Action',
  actionBadge = 'Action Required',
  actionDescription = 'Please confirm this update for the selected shop.',
  actionTheme = 'amber',
  confirmButtonLabel = 'Accept & Confirm',
  isSubmitting = false,
}) {
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = isSubmitting || internalLoading

  if (!isOpen || !shop) return null

  const handleAccept = async () => {
    if (loading) return
    setInternalLoading(true)
    try {
      const res = await onConfirm()
      if (res !== false) onClose()
    } catch (err) {
      console.error('AdminActionConfirmModal action error:', err)
    } finally {
      setInternalLoading(false)
    }
  }

  // Theme configuration for visual styles
  const getThemeStyles = () => {
    switch (actionTheme) {
      case 'emerald':
        return {
          iconBox: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          subtitle: 'text-emerald-400',
          banner: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
          bannerIcon: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
          icon: Zap,
        }
      case 'purple':
        return {
          iconBox: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
          subtitle: 'text-purple-400',
          banner: 'bg-purple-950/40 border-purple-800/60 text-purple-200',
          bannerIcon: 'text-purple-400',
          badge: 'bg-purple-950 text-purple-300 border-purple-800',
          btnConfirm: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
          icon: Zap,
        }
      case 'brand':
        return {
          iconBox: 'bg-brand/15 border-brand/30 text-brand',
          subtitle: 'text-brand',
          banner: 'bg-purple-950/40 border-purple-800/60 text-purple-200',
          bannerIcon: 'text-purple-400',
          badge: 'bg-brand/20 text-white border-brand/40',
          btnConfirm: 'bg-brand hover:bg-brand-hover shadow-brand/30',
          icon: Zap,
        }
      case 'amber':
      default:
        return {
          iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          subtitle: 'text-amber-400',
          banner: 'bg-amber-950/50 border-amber-800/60 text-amber-200',
          bannerIcon: 'text-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          btnConfirm: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30',
          icon: Clock,
        }
    }
  }

  const theme = getThemeStyles()
  const IconComponent = theme.icon
  const shopName = shop.shopName || shop.name || 'Unknown Shop'
  const shopCode = shop.shopCode || shop.code || '—'
  const ownerName = shop.ownerName || shop.owner || ''
  const phone = shop.phone || shop.mobile || ''
  const expiryDate = shop.demoExpiresAt || shop.subscriptionExpiresAt || shop.expiresAt

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !loading) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-stone-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/90">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${theme.iconBox}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white font-heading truncate leading-tight">
                  {actionTitle}
                </h3>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${theme.subtitle}`}
                >
                  Confirmation Required
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 flex flex-col gap-3.5">
            {/* Notice Banner */}
            <div
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 border text-xs leading-relaxed ${theme.banner}`}
            >
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${theme.bannerIcon}`} />
              <div>
                <span className="font-semibold">{actionDescription}</span>
              </div>
            </div>

            {/* Target Shop Details Card */}
            <div className="bg-stone-950 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-stone-800/80 flex flex-col gap-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-0.5">
                Target Shop Details
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-400 flex items-center gap-1.5 shrink-0">
                  <Store className="w-3.5 h-3.5 text-stone-500" />
                  Shop Name
                </span>
                <span className="text-xs font-black text-white truncate text-right">
                  {shopName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-400 shrink-0">Shop Code</span>
                <span className="font-mono text-xs font-bold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                  {shopCode}
                </span>
              </div>

              {ownerName && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400 shrink-0">Owner</span>
                  <span className="text-xs font-medium text-stone-300 truncate text-right">
                    {ownerName}
                  </span>
                </div>
              )}

              {phone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400 flex items-center gap-1.5 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    Phone
                  </span>
                  <span className="font-mono text-xs text-stone-300">{phone}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-stone-400 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  Current Expiry
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  {formatDateTime(expiryDate, 'Active')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80 mt-0.5">
                <span className="text-xs text-stone-400 font-semibold shrink-0">
                  Selected Action
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badge}`}
                >
                  {actionBadge}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 text-center">
              Are you sure you want to approve this update?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={loading}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs font-black flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme.btnConfirm}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{confirmButtonLabel}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default memo(AdminActionConfirmModal)
