import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Store,
  Clock,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  FileText,
  Trash2,
  Phone,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import AdminDemoTimer from '../ui/AdminDemoTimer'
import AdminDeleteConfirmModal from './AdminDeleteConfirmModal'
import AdminActionConfirmModal from './AdminActionConfirmModal'
import { formatDateTime } from '../../utils/dateUtil'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

function AdminShopActionModal({ shop, isOpen, onClose }) {
  const {
    extendShopDemo,
    updateShopPlan,
    toggleShopStatus,
    deleteShop,
    settingsData,
    fetchSettings,
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState('actions') // 'actions' | 'jobs'
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(null)

  const fetchJobs = async () => {
    if (!shop?._id) return
    setJobsLoading(true)
    try {
      const res = await api.get(`/admin/shops/${shop._id}/jobs`)
      if (res.data?.success && res.data?.data)
        setJobs(res.data.data.jobs || [])
    } catch { } finally {
      setJobsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && shop?._id) {
      const timer = setTimeout(() => {
        fetchJobs()
        if (!settingsData?.demoDurationHours && typeof fetchSettings === 'function')
          fetchSettings()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, shop])

  if (!isOpen || !shop) return null

  // Request Confirmation for Demo Extension (24h, 7d, 15d)
  const requestExtend = (hours) => {
    let label = `+${hours} Hrs`
    let description = `Extend free demo trial duration for this shop by ${hours} hours.`
    if (hours === 168) {
      label = '+7 Days'
      description = 'Extend free demo trial duration for this shop by 7 days (168 hours).'
    } else if (hours === 360) {
      label = '+15 Days'
      description = 'Extend free demo trial duration for this shop by 15 days (360 hours).'
    }

    setPendingConfirm({
      title: `Confirm Demo Extension (${label})`,
      badge: `${label} Free Demo`,
      description: `${description} Extra duration is added to the active timer in real-time.`,
      theme: 'amber',
      confirmLabel: `Accept & Extend ${label}`,
      execute: async () => {
        const success = await extendShopDemo(shop._id, hours)
        if (success) {
          toast.success(`Demo extended by ${label}!`)
          onClose()
        }
        return success
      },
    })
  }

  // Request Confirmation for Plan Change / Grant (48h, Month, Year)
  const requestPlanChange = (planType, days = 30) => {
    let title = 'Confirm Plan Update'
    let badge = '+30 Days (Monthly Plan)'
    let description =
      'Grant full monthly paid subscription (30 days validity). Unlocks all premium features and unlimited printing.'
    let theme = 'emerald'
    let label = 'Accept & Grant Monthly Plan'
    let toastLabel = 'Monthly (30 Days)'

    if (planType === 'FREE_TRIAL') {
      title = 'Confirm 48 Hours Demo Grant'
      badge = '48 Hours Free Demo'
      description =
        'Grant 48 hours free demo trial validity. Adds 48 hours to the shop timer.'
      theme = 'amber'
      label = 'Accept & Grant 48 Hours'
      toastLabel = '48 Hours Demo'
    } else if (planType === 'YEARLY_799') {
      title = 'Confirm Yearly Subscription Grant'
      badge = '+365 Days (Yearly Plan)'
      description =
        'Grant 1 full year paid subscription (365 days validity). Adds days to existing active plan.'
      theme = 'purple'
      label = 'Accept & Grant Yearly Plan'
      toastLabel = 'Yearly (365 Days)'
    }

    setPendingConfirm({
      title,
      badge,
      description,
      theme,
      confirmLabel: label,
      execute: async () => {
        const success = await updateShopPlan(shop._id, planType, days, true)
        if (success) {
          toast.success(`Plan updated to ${toastLabel}!`)
          onClose()
        }
        return success
      },
    })
  }

  // Handle Suspend Toggle directly
  const handleToggleSuspend = async () => {
    setIsSubmitting(true)
    const targetSuspended = !shop.isSuspended
    const success = await toggleShopStatus(shop._id, targetSuspended)
    setIsSubmitting(false)
    if (success) onClose()
  }

  const pType = shop.planType || (shop.isDemoAccount ? 'FREE_TRIAL' : 'MONTHLY_299')

  // Helper for Job Status pill
  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'PRINTED_SUCCESSFULLY':
        return { label: 'Printed', cls: 'bg-emerald-950 text-emerald-300 border-emerald-900' }
      case 'FAILED':
        return { label: 'Failed', cls: 'bg-rose-950 text-rose-300 border-rose-900' }
      case 'CANCELLED':
        return { label: 'Cancelled', cls: 'bg-stone-900 text-stone-400 border-stone-800' }
      default:
        return { label: status || 'Pending', cls: 'bg-amber-950 text-amber-300 border-amber-900' }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] my-auto text-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 md:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/80 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand/15 text-brand border border-rose-900/60 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-white font-heading flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="truncate max-w-42.5 sm:max-w-xs" title={shop.shopName}>
                    {shop.shopName}
                  </span>
                  <span className="font-mono text-[11px] sm:text-xs text-stone-300 font-semibold bg-stone-900 px-1.5 py-0.5 rounded-md border border-stone-800 shrink-0">
                    {shop.shopCode}
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-stone-400 text-xs font-medium mt-0.5">
                  {shop.ownerName && <span>Owner: {shop.ownerName}</span>}
                  {shop.ownerName && shop.phone && <span>·</span>}
                  {shop.phone ? (
                    <a
                      href={`tel:${shop.phone}`}
                      className="inline-flex items-center gap-1 text-stone-300 hover:text-amber-400 transition-colors group"
                      title={`Call ${shop.shopName} (${shop.phone})`}
                    >
                      <Phone className="w-3 h-3 text-stone-400 group-hover:text-amber-400 transition-colors shrink-0" />
                      <span className="group-hover:underline">{shop.phone}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
              title="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Current Status Bar */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-stone-950/60 border-b border-stone-800/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs text-stone-400 font-bold">Current Plan:</span>
              <span className="text-xs font-extrabold text-white">
                {pType === 'FREE_TRIAL' || shop.isDemoAccount
                  ? 'Free Demo'
                  : pType === 'YEARLY_799'
                    ? 'Yearly Plan'
                    : 'Monthly Plan'}
              </span>
            </div>
            <AdminDemoTimer
              demoExpiresAt={shop.demoExpiresAt}
              subscriptionExpiresAt={shop.subscriptionExpiresAt}
              createdAt={shop.createdAt}
              status={shop.status}
              planType={pType}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-stone-800/80 bg-stone-950/40">
            <button
              type="button"
              onClick={() => setActiveTab('actions')}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${activeTab === 'actions'
                ? 'border-brand text-brand'
                : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
            >
              <span className="hidden sm:inline">Super Admin </span>
              <span>Actions & Overrides</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${activeTab === 'jobs'
                ? 'border-brand text-brand'
                : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
            >
              <span>Print History</span> ({jobs.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden flex-1 flex flex-col gap-4 sm:gap-5">
            {activeTab === 'actions' ? (
              <>
                {/* 1. Trial Extension Card (24h, 7d, 15d) */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-950/90 border border-stone-800 flex flex-col gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Extend Demo Trial Duration</span>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Adds extra trial duration directly to this shop's countdown timer in real-time.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => requestExtend(24)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-200 font-bold text-xs border border-stone-800/90 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50 min-h-9.5 sm:min-h-10"
                      title="Extend Demo by 24 Hours"
                    >
                      +24 Hrs
                    </button>
                    <button
                      type="button"
                      onClick={() => requestExtend(168)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-200 font-bold text-xs border border-stone-800/90 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50 min-h-9.5 sm:min-h-10"
                      title="Extend Demo by 7 Days"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => requestExtend(360)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-200 font-bold text-xs border border-stone-800/90 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50 min-h-9.5 sm:min-h-10"
                      title="Extend Demo by 15 Days"
                    >
                      +15 Days
                    </button>
                  </div>
                </div>

                {/* 2. Manual Plan Upgrade Card (48h, Month, Year) */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-950/90 border border-stone-800 flex flex-col gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Grant Subscription Plan / Validity</span>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Instantly grant active subscription status (adds days to existing active plan).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => requestPlanChange('FREE_TRIAL', 2)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 active:scale-95 text-amber-200 font-bold text-xs border border-amber-800/70 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all disabled:opacity-50 min-h-11"
                      title="Grant 48 Hours Demo Validity"
                    >
                      <span>48 Hours</span>
                      <span className="text-[10px] font-medium opacity-75 font-mono">
                        +48h Free Trial
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => requestPlanChange('MONTHLY_299', 30)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 active:scale-95 text-emerald-200 font-bold text-xs border border-emerald-800/70 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all disabled:opacity-50 min-h-11"
                      title="Grant Monthly Plan (30 Days)"
                    >
                      <span>Monthly Plan</span>
                      <span className="text-[10px] font-medium opacity-75 font-mono">
                        +30 Days Validity
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => requestPlanChange('YEARLY_799', 365)}
                      disabled={isSubmitting}
                      className="py-2 sm:py-2.5 px-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 active:scale-95 text-purple-200 font-bold text-xs border border-purple-800/70 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all disabled:opacity-50 min-h-11"
                      title="Grant Yearly Plan (365 Days)"
                    >
                      <span>Yearly Plan</span>
                      <span className="text-[10px] font-medium opacity-75 font-mono">
                        +365 Days Validity
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Suspend / Activate Interactive Two-Way Toggle */}
                <div
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 min-w-0 ${shop.isSuspended
                    ? 'bg-rose-950/40 border-rose-800/80'
                    : 'bg-emerald-950/30 border-emerald-800/60'
                    }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                      {shop.isSuspended ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">
                        Status: {shop.isSuspended ? 'Suspended (Blocked)' : 'Active (Operational)'}
                      </span>
                    </span>
                    <span className="text-[11px] text-stone-400 leading-snug">
                      {shop.isSuspended
                        ? 'Kiosk and uploads are frozen for this shop'
                        : 'Kiosk and prints are running normally'}
                    </span>
                  </div>

                  {/* Two-Way Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleSuspend}
                    disabled={isSubmitting}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${!shop.isSuspended ? 'bg-emerald-600' : 'bg-stone-700'
                      }`}
                    title={shop.isSuspended ? 'Activate Shop' : 'Suspend Shop'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${!shop.isSuspended ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </>
            ) : (
              /* Recent Jobs History List */
              <div className="flex flex-col gap-2.5">
                {jobsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                    <span className="text-xs font-semibold">Loading print history...</span>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 text-xs font-medium">
                    No print jobs registered for this shop yet.
                  </div>
                ) : (
                  jobs.map((job) => {
                    const statusBadge = getJobStatusBadge(job.status)
                    const formattedDate = formatDateTime(job.createdAt, '—')

                    return (
                      <div
                        key={job._id}
                        className="p-3 rounded-xl sm:rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs gap-2.5 sm:gap-3 min-w-0"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-bold text-stone-200 truncate block text-xs"
                              title={job.originalFileName || `Job #${job.jobId}`}
                            >
                              {job.originalFileName || `Job #${job.jobId}`}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-500 mt-0.5">
                              <span>
                                {job.totalPages} pgs · {job.copies} copies · ₹{job.totalAmount}
                              </span>
                              <span>·</span>
                              <span className="font-mono text-stone-400">{formattedDate}</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${statusBadge.cls}`}
                          title={`Status: ${job.status}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
              className="py-2 px-3 sm:px-3.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-900/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 min-h-9.5"
              title="Permanently Delete Shop"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete Shop</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 sm:px-5 rounded-xl text-xs font-bold text-stone-300 border border-stone-800 hover:bg-stone-900 active:scale-95 transition-all cursor-pointer min-h-9.5"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action Confirmation Modal (for Trial Extension or Plan Grant) */}
      {pendingConfirm && (
        <AdminActionConfirmModal
          isOpen={Boolean(pendingConfirm)}
          onClose={() => setPendingConfirm(null)}
          onConfirm={pendingConfirm.execute}
          shop={shop}
          actionTitle={pendingConfirm.title}
          actionBadge={pendingConfirm.badge}
          actionDescription={pendingConfirm.description}
          actionTheme={pendingConfirm.theme}
          confirmButtonLabel={pendingConfirm.confirmLabel}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Shop Confirm Modal */}
      {showDeleteConfirm && (
        <AdminDeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            const success = await deleteShop(shop._id)
            if (success) onClose()
          }}
          title="Delete Shop Account"
          itemType="shop"
          itemData={shop}
        />
      )}
    </AnimatePresence>
  )
}

export default memo(AdminShopActionModal)
