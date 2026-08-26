import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Plus, Cloud, Sparkles, Receipt, FileText, ArrowRight, Clock, XCircle } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { getSocket } from '../../lib/socket'

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
  const pm = String(createdJob?.paymentMethod || '').toUpperCase()
  const isOnlineGateway = pm === 'RAZORPAY' || pm === 'ONLINE_GATEWAY' || pm === 'DEMO_BYPASS'
  const isCounterPayment = !isOnlineGateway
  const [printStatus, setPrintStatus] = useState(() => (isCounterPayment ? 'WAITING_COUNTER_APPROVAL' : 'PAYMENT_VERIFIED'))

  const activeJobId = jobId || createdJob?.jobId || `JOB_${Date.now().toString().slice(-6)}`
  const hasPlayedSoundRef = useRef(false)

  // Reset audio trigger flag when new job arrives
  useEffect(() => {
    hasPlayedSoundRef.current = false
  }, [activeJobId])

  // Instant success sound trigger (full volume) when status becomes COMPLETED / PRINTED
  useEffect(() => {
    if (printStatus === 'COMPLETED' && !hasPlayedSoundRef.current) {
      hasPlayedSoundRef.current = true
      try {
        const audio = new Audio('/audio/greet.mpeg')
        audio.volume = 1.0
        audio.play().catch((err) => {
          console.warn('[Audio Autoplay]: Could not play greet sound:', err.message)
        })
      } catch (err) {
        console.warn('[Audio Error]:', err.message)
      }
    }
  }, [printStatus])

  // Live Socket.IO Listener for instant approval/completion without refresh
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !activeJobId) return

    const handleJobStatus = (data) => {
      if (!data?.jobId) return
      const incomingId = String(data.jobId).toUpperCase()
      const currentId = String(activeJobId).toUpperCase()
      if (incomingId === currentId || incomingId.includes(currentId) || currentId.includes(incomingId)) {
        const s = String(data.status).toUpperCase()
        if (
          s === 'COMPLETED' ||
          s === 'PRINTED_SUCCESS' ||
          s === 'PRINTED' ||
          s === 'PRINTED_SUCCESSFULLY' ||
          s === 'SUCCESS'
        ) {
          setPrintStatus('COMPLETED')
        } else if (s === 'PRINTING' || s === 'SPOOLING') {
          setPrintStatus('PRINTING')
        } else if (s === 'DISPATCHED_TO_AGENT') {
          if (!isCounterPayment) setPrintStatus('DISPATCHED_TO_AGENT')
        } else if (
          s === 'FAILED' ||
          s === 'CANCELLED' ||
          s === 'PRINT_FAILED' ||
          s === 'REJECTED' ||
          s === 'DENIED'
        ) {
          setPrintStatus('CANCELLED')
        }
      }
    }

    socket.on('JOB_STATUS_UPDATED', handleJobStatus)
    return () => {
      socket.off('JOB_STATUS_UPDATED', handleJobStatus)
    }
  }, [activeJobId, isCounterPayment])

  // Fast forward simulation ONLY for pre-verified Online payments
  useEffect(() => {
    if (isCounterPayment) return

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
  }, [isAgentOnline, isCounterPayment])

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
        ) : printStatus === 'CANCELLED' ? (
          <div className="w-18 h-18 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <XCircle className="w-10 h-10 stroke-[2.5]" />
          </div>
        ) : printStatus === 'WAITING_COUNTER_APPROVAL' ? (
          <div className="w-18 h-18 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 relative">
            <Clock className="w-9 h-9 stroke-[2.2] animate-spin" style={{ animationDuration: '4s' }} />
          </div>
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
              : printStatus === 'CANCELLED'
              ? 'Order Cancelled ❌'
              : printStatus === 'WAITING_COUNTER_APPROVAL'
              ? 'Pay Cash at Counter 💵'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'Job Queued in Cloud ☁️'
              : 'Auto-Printing Your Document...'}
          </h2>
          <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-sm">
            {printStatus === 'COMPLETED'
              ? 'Please collect your fresh warm printout from the printer counter.'
              : printStatus === 'CANCELLED'
              ? 'This print order was cancelled or rejected by the shopkeeper at the counter.'
              : printStatus === 'WAITING_COUNTER_APPROVAL'
              ? `Please pay ₹${totalAmount} cash to the shopkeeper at the counter. Once approved, your document will print automatically.`
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
            <span>{printStatus === 'COMPLETED' ? 'Amount Paid' : 'Amount to Pay at Counter'}</span>
            <span className={`${printStatus === 'COMPLETED' ? 'text-emerald-600' : printStatus === 'CANCELLED' ? 'text-rose-600 line-through' : 'text-amber-700'} font-heading`}>
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Timeline Progress List */}
        <div className="w-full bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col gap-2.5 text-left text-xs font-bold">
          {/* Step 1 */}
          <div className={`flex items-center gap-2.5 ${printStatus === 'COMPLETED' ? 'text-emerald-700' : printStatus === 'CANCELLED' ? 'text-rose-700' : isCounterPayment ? 'text-amber-700 font-extrabold' : 'text-emerald-700'}`}>
            {printStatus === 'CANCELLED' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${printStatus === 'COMPLETED' || !isCounterPayment ? 'text-emerald-600' : 'text-amber-500'} shrink-0`} />
            )}
            <span>
              {printStatus === 'CANCELLED'
                ? `1. Counter Payment Denied (₹${totalAmount})`
                : isCounterPayment
                ? printStatus === 'COMPLETED'
                  ? `1. Cash Paid at Counter (₹${totalAmount})`
                  : `1. Pay ₹${totalAmount} Cash at Counter`
                : `1. Payment Verified (₹${totalAmount})`}
            </span>
          </div>

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'COMPLETED' || printStatus === 'PRINTING'
                ? 'text-emerald-700'
                : printStatus === 'CANCELLED'
                ? 'text-rose-700'
                : printStatus === 'WAITING_COUNTER_APPROVAL'
                ? 'text-amber-700 font-medium'
                : 'text-stone-400'
            }`}
          >
            {printStatus === 'CANCELLED' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${printStatus === 'COMPLETED' || printStatus === 'PRINTING' ? 'text-emerald-600' : 'text-stone-300'} shrink-0`} />
            )}
            <span>
              {printStatus === 'CANCELLED'
                ? '2. Order Rejected by Shopkeeper'
                : isCounterPayment
                ? printStatus === 'COMPLETED'
                  ? '2. Approved by Shopkeeper'
                  : '2. Waiting for Shopkeeper Approval'
                : isAgentOnline
                ? '2. Dispatched to Shop PC Agent'
                : '2. Queued in Cloud'}
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'PRINTING' || printStatus === 'COMPLETED'
                ? 'text-emerald-700'
                : printStatus === 'CANCELLED'
                ? 'text-stone-400'
                : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${printStatus === 'COMPLETED' || printStatus === 'PRINTING' ? 'text-emerald-600' : 'text-stone-300'} shrink-0`} />
            <span>{printStatus === 'CANCELLED' ? '3. Hardware Print Aborted' : '3. Hardware Printer Output'}</span>
          </div>

          {/* Step 4 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'COMPLETED' ? 'text-emerald-700' : 'text-stone-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${printStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-stone-300'} shrink-0`} />
            <span>{printStatus === 'CANCELLED' ? '4. File Deleted from Queue' : '4. Job Complete & Ready for Collection'}</span>
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
