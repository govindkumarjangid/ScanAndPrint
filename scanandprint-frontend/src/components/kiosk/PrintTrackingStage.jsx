import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Plus, Cloud, Sparkles, Receipt, FileText, ArrowRight } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'

export default function PrintTrackingStage({
  shopInfo,
  selectedFile,
  selectedPagesCount,
  colorType,
  copies,
  totalAmount,
  onNewOrder,
}) {
  const { jobId, createdJob, paymentTxnId } = useKioskStore()
  const isAgentOnline = Boolean(shopInfo?.isOnline)
  const [printStatus, setPrintStatus] = useState('PAYMENT_VERIFIED')

  const activeJobId = jobId || createdJob?.jobId || `JOB_${Date.now().toString().slice(-6)}`

  useEffect(() => {
    if (isAgentOnline) {
      const timer1 = setTimeout(() => setPrintStatus('DISPATCHED_TO_AGENT'), 1200)
      const timer2 = setTimeout(() => setPrintStatus('PRINTING'), 2800)
      const timer3 = setTimeout(() => setPrintStatus('COMPLETED'), 5000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setPrintStatus('QUEUED_IN_CLOUD')
    }
  }, [isAgentOnline])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-5 max-w-md mx-auto w-full"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xl flex flex-col items-center text-center gap-5">
        
        {/* Status Animation Icon */}
        {printStatus === 'COMPLETED' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-18 h-18 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </motion.div>
        ) : printStatus === 'QUEUED_IN_CLOUD' ? (
          <div className="w-18 h-18 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 relative">
            <Cloud className="w-9 h-9 stroke-[2.2] animate-pulse" />
          </div>
        ) : (
          <div className="w-18 h-18 rounded-3xl bg-rose-100 text-brand flex items-center justify-center shadow-lg shadow-rose-500/20 relative">
            <Printer className="w-9 h-9 stroke-[2.2] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
          </div>
        )}

        {/* Status Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-100 px-3 py-0.5 rounded-full w-max mx-auto border border-stone-200">
            Order ID: {activeJobId}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heading mt-1">
            {printStatus === 'COMPLETED'
              ? 'Print Complete! 🎉'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'Job Queued in Cloud ☁️'
              : 'Auto-Printing Your Document...'}
          </h2>
          <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-sm">
            {printStatus === 'COMPLETED'
              ? 'Please collect your fresh warm printout from the printer counter.'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'The shop PC is currently offline. Your file is safely queued and will automatically print when the computer turns on.'
              : 'Your file has been verified and routed directly to the shop printer hardware.'}
          </p>
        </div>

        {/* Order Receipt Details Card */}
        <div className="w-full bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left flex flex-col gap-2 text-xs font-semibold">
          <div className="flex items-center justify-between text-stone-500">
            <span className="flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-stone-400" /> Digital Receipt
            </span>
            <span className="font-mono text-[10px] text-stone-400">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>Shop</span>
            <span className="text-stone-900 font-bold truncate max-w-40">
              {shopInfo?.shopName || 'Cyber Cafe & Prints'}
            </span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>Pages & Copies</span>
            <span className="text-stone-900 font-bold">
              {selectedPagesCount} {selectedPagesCount === 1 ? 'Page' : 'Pages'} · {copies} {copies === 1 ? 'Set' : 'Sets'} ({colorType === 'COLOR' ? 'Color' : 'B&W'})
            </span>
          </div>

          <div className="flex justify-between border-t border-stone-200/80 pt-2 text-stone-900 font-extrabold text-sm">
            <span>Amount Paid</span>
            <span className="text-emerald-600 font-heading">₹{totalAmount}</span>
          </div>
        </div>

        {/* Timeline Progress List */}
        <div className="w-full bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col gap-2.5 text-left text-xs font-bold">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1. Payment Verified (₹{totalAmount})</span>
          </div>

          <div
            className={`flex items-center gap-2.5 ${
              printStatus !== 'PAYMENT_VERIFIED' ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isAgentOnline ? '2. Dispatched to Shop PC Agent' : '2. Queued in Cloud'}
            </span>
          </div>

          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'PRINTING' || printStatus === 'COMPLETED'
                ? 'text-emerald-700'
                : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>3. Hardware Printer Output</span>
          </div>

          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'COMPLETED' ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>4. Job Complete & Ready for Collection</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onNewOrder}
          className="btn btn-primary w-full py-3.5 shadow-md flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Print Another Document</span>
        </button>
      </div>
    </motion.div>
  )
}
