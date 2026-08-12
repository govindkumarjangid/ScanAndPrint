import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Plus, AlertCircle, Cloud, Sparkles } from 'lucide-react'

export default function PrintTrackingStage({
  shopInfo,
  totalAmount,
  onNewOrder,
}) {
  const isAgentOnline = shopInfo?.isOnline ?? true
  const [printStatus, setPrintStatus] = useState('PAYMENT_VERIFIED')

  useEffect(() => {
    if (isAgentOnline) {
      const timer1 = setTimeout(() => setPrintStatus('DISPATCHED_TO_AGENT'), 1200)
      const timer2 = setTimeout(() => setPrintStatus('PRINTING'), 2800)
      const timer3 = setTimeout(() => setPrintStatus('COMPLETED'), 4800)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      // If agent is offline, job stays queued in cloud
      setPrintStatus('QUEUED_IN_CLOUD')
    }
  }, [isAgentOnline])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6 max-w-md mx-auto w-full"
    >
      <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-2xl flex flex-col items-center text-center gap-6">
        {/* Status Animation Icon */}
        {printStatus === 'COMPLETED' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </motion.div>
        ) : printStatus === 'QUEUED_IN_CLOUD' ? (
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 relative">
            <Cloud className="w-10 h-10 stroke-[2.2] animate-pulse" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-100 text-brand flex items-center justify-center shadow-lg shadow-rose-500/20 relative">
            <Printer className="w-10 h-10 stroke-[2.2] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
          </div>
        )}

        {/* Status Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
            {printStatus === 'COMPLETED'
              ? 'Print Completed! 🎉'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'Job Safely Queued in Cloud ☁️'
              : 'Auto-Printing Your Document...'}
          </h2>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {printStatus === 'COMPLETED'
              ? 'Please collect your fresh printouts from the shop counter.'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'Desktop Print Agent is offline. Your print job will automatically print as soon as the shop PC turns on.'
              : 'Your file has been verified and routed silently to the shop printer hardware.'}
          </p>
        </div>

        {/* Timeline Progress List */}
        <div className="w-full bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-3 text-left text-xs font-bold">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1. Payment ₹{totalAmount} Verified</span>
          </div>

          <div
            className={`flex items-center gap-3 ${
              printStatus !== 'PAYMENT_VERIFIED' ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isAgentOnline ? '2. Dispatched to Shop PC Agent' : '2. Queued in Cloud Storage'}
            </span>
          </div>

          <div
            className={`flex items-center gap-3 ${
              printStatus === 'PRINTING' || printStatus === 'COMPLETED'
                ? 'text-emerald-700'
                : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>3. Hardware Printer Output</span>
          </div>

          <div
            className={`flex items-center gap-3 ${
              printStatus === 'COMPLETED' ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>4. Job Complete & Temp File Purged</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onNewOrder}
          className="btn btn-primary w-full py-4 shadow-md flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Print Another Document</span>
        </button>
      </div>
    </motion.div>
  )
}
