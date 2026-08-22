import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Store,
  Clock,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Loader2,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminShopActionModal({ shop, isOpen, onClose }) {
  const { extendShopDemo, updateShopPlan, toggleShopStatus } = useAdminStore()
  const [activeTab, setActiveTab] = useState('actions') // 'actions' | 'jobs'
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && shop?._id) {
      fetchJobs()
    }
  }, [isOpen, shop])

  const fetchJobs = async () => {
    if (!shop?._id) return
    setJobsLoading(true)
    try {
      const res = await api.get(`/admin/shops/${shop._id}/jobs`)
      if (res.data.success && res.data.data) {
        setJobs(res.data.data.jobs || [])
      }
    } catch (e) {
      console.warn('Shop jobs fetch note:', e)
    } finally {
      setJobsLoading(false)
    }
  }

  if (!isOpen || !shop) return null

  const handleExtend = async (hours) => {
    setIsSubmitting(true)
    const success = await extendShopDemo(shop._id, hours)
    setIsSubmitting(false)
    if (success) onClose()
  }

  const handlePlanChange = async (planType, days = 30) => {
    setIsSubmitting(true)
    const success = await updateShopPlan(shop._id, planType, days, true)
    setIsSubmitting(false)
    if (success) onClose()
  }

  const handleToggleSuspend = async () => {
    setIsSubmitting(true)
    const targetSuspended = !shop.isSuspended
    const success = await toggleShopStatus(shop._id, targetSuspended)
    setIsSubmitting(false)
    if (success) onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand border border-rose-900/60 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-heading flex items-center gap-2">
                  <span>{shop.shopName}</span>
                  <span className="font-mono text-xs text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                    {shop.shopCode}
                  </span>
                </h3>
                <p className="text-stone-400 text-xs font-medium mt-0.5">
                  Owner: {shop.ownerName} · {shop.phone}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-stone-800/80 bg-stone-950/40">
            <button
              onClick={() => setActiveTab('actions')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'actions'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Super Admin Actions & Overrides
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Recent Print History ({jobs.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            
            {activeTab === 'actions' ? (
              <>
                {/* 1. Trial Extension Card */}
                <div className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Extend Demo Trial Duration</span>
                  </div>
                  <p className="text-stone-400 text-xs">
                    Adds extra trial time directly to this shop's countdown timer without payment.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExtend(2)}
                      disabled={isSubmitting}
                      className="py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs border border-stone-800 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> +2 Hours
                    </button>
                    <button
                      onClick={() => handleExtend(24)}
                      disabled={isSubmitting}
                      className="py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs border border-stone-800 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> +24 Hours
                    </button>
                    <button
                      onClick={() => handleExtend(168)}
                      disabled={isSubmitting}
                      className="py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs border border-stone-800 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> +7 Days
                    </button>
                  </div>
                </div>

                {/* 2. Manual Plan Upgrade Card */}
                <div className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Manual Plan Override / Grant Status</span>
                  </div>
                  <p className="text-stone-400 text-xs">
                    Instantly grant active paid subscription status to this shop.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handlePlanChange('MONTHLY_299', 30)}
                      disabled={isSubmitting}
                      className="py-2.5 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs border border-rose-900 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <span>Grant Monthly (30 Days)</span>
                    </button>
                    <button
                      onClick={() => handlePlanChange('YEARLY_799', 365)}
                      disabled={isSubmitting}
                      className="py-2.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 font-bold text-xs border border-purple-900 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <span>Grant Yearly (365 Days)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Suspend / Activate Interactive Two-Way Toggle */}
                <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  shop.isSuspended
                    ? 'bg-rose-950/40 border-rose-800/80'
                    : 'bg-emerald-950/30 border-emerald-800/60'
                }`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      {shop.isSuspended ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>Status: {shop.isSuspended ? 'Suspended (Blocked)' : 'Active (Operational)'}</span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {shop.isSuspended ? 'Kiosk and uploads are frozen for this shop' : 'Kiosk and prints are running normally'}
                    </span>
                  </div>

                  {/* Two-Way Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleSuspend}
                    disabled={isSubmitting}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                      !shop.isSuspended ? 'bg-emerald-600' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        !shop.isSuspended ? 'translate-x-7' : 'translate-x-0'
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
                  jobs.map((job) => (
                    <div
                      key={job._id}
                      className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-stone-400" />
                        <div>
                          <div className="font-bold text-stone-200">{job.originalFileName || `Job #${job.jobId}`}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {job.totalPages} pgs · {job.copies} copies · ₹{job.totalAmount}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        job.status === 'PRINTED_SUCCESSFULLY'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-900'
                          : 'bg-stone-900 text-stone-400 border-stone-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end">
            <button
              onClick={onClose}
              className="btn btn-outline py-2 px-5 rounded-xl text-xs font-bold text-stone-300 border-stone-800 hover:bg-stone-900 cursor-pointer"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
