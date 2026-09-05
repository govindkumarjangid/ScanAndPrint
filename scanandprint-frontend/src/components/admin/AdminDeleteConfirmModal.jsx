import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  Store,
  Receipt,
  Phone,
  Calendar,
  ShieldAlert,
} from 'lucide-react'
import { formatDateTime } from '../../utils/dateUtil'

export default function AdminDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Permanent Deletion',
  itemType = 'shop', // 'shop' | 'transaction'
  itemData = null,
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !itemData) return null

  const isShop = itemType === 'shop'
  const shopName = itemData.shopName || itemData.name || 'Unknown Shop'
  const shopCode = itemData.shopCode || itemData.code || '—'
  const ownerName = itemData.ownerName || itemData.owner || '—'
  const phone = itemData.phone || itemData.mobile || itemData.customerPhone || '—'
  const jobId = itemData.jobId || itemData.paymentTxnId || itemData._id || '—'
  const amount = itemData.totalAmount ?? itemData.amount ?? 0
  const createdAt = formatDateTime(itemData.createdAt)

  const handleApprove = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (e) {
      console.error('Delete action failed:', e)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-stone-200"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-heading leading-tight">
                  {title}
                </h3>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Approval Required
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 flex flex-col gap-4">
            {/* Warning Banner */}
            <div className="bg-rose-950/50 border border-rose-800/60 rounded-2xl p-3.5 flex items-start gap-3 text-rose-200">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">
                {isShop ? (
                  <>
                    Warning: Deleting this shop will <strong className="text-white">permanently erase</strong> all associated print jobs, registered agent devices, and owner data. This cannot be undone.
                  </>
                ) : (
                  <>
                    Warning: Deleting this transaction will <strong className="text-white">permanently remove</strong> this print record and payment log from the database.
                  </>
                )}
              </div>
            </div>

            {/* Target Item Details Card */}
            <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800/80 flex flex-col gap-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Target {isShop ? 'Shop' : 'Transaction'} Details
              </div>

              {isShop ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-stone-400" />
                      Shop Name
                    </span>
                    <span className="text-xs font-black text-white">{shopName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">Shop Code</span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                      {shopCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">Owner</span>
                    <span className="text-xs font-medium text-stone-300">{ownerName}</span>
                  </div>

                  {phone && phone !== '—' && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        Mobile
                      </span>
                      <span className="font-mono text-xs text-stone-300">{phone}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-stone-400" />
                      Job / Txn ID
                    </span>
                    <span className="font-mono text-xs font-bold text-white select-all">
                      {jobId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">Shop</span>
                    <span className="text-xs font-semibold text-stone-300">
                      {itemData.shopId?.shopName || itemData.shopCode || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">Amount</span>
                    <span className="text-sm font-black text-emerald-400">
                      ₹{amount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Date &amp; Time
                    </span>
                    <span className="text-xs text-stone-400">{createdAt}</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-xs text-stone-400 text-center">
              Are you sure you want to approve this deletion?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-5 sm:p-6 border-t border-stone-800 bg-stone-950 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Approve &amp; Delete</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
