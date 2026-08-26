import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Printer, Plus, Cloud, Sparkles, Receipt, FileText, ArrowRight, Clock, XCircle, ShieldCheck } from 'lucide-react'
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
  const { jobId, createdJob, paymentTxnId, isPaymentVerified } = useKioskStore()
  const isAgentOnline = Boolean(shopInfo?.isOnline)

  // Explicit Payment Method Determination
  const pm = String(createdJob?.paymentMethod || '').toUpperCase().trim()
  const isOnlinePayment =
    Boolean(isPaymentVerified) ||
    Boolean(paymentTxnId) ||
    pm === 'RAZORPAY' ||
    pm === 'ONLINE_GATEWAY' ||
    pm === 'ONLINE' ||
    pm === 'UPI_ONLINE' ||
    pm === 'DEMO_BYPASS'

  const isCounterPayment = !isOnlinePayment
  const [printStatus, setPrintStatus] = useState(() => (isOnlinePayment ? 'PAYMENT_VERIFIED' : 'WAITING_COUNTER_APPROVAL'))

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
          if (isOnlinePayment) setPrintStatus('DISPATCHED_TO_AGENT')
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
  }, [activeJobId, isOnlinePayment])

  // Fast forward simulation for Online payments (smooth UI progress)
  useEffect(() => {
    if (!isOnlinePayment) return

    if (isAgentOnline) {
      const timer1 = setTimeout(() => setPrintStatus((prev) => (prev === 'COMPLETED' ? prev : 'DISPATCHED_TO_AGENT')), 1000)
      const timer2 = setTimeout(() => setPrintStatus((prev) => (prev === 'COMPLETED' ? prev : 'PRINTING')), 2200)
      const timer3 = setTimeout(() => setPrintStatus('COMPLETED'), 4500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setPrintStatus('QUEUED_IN_CLOUD')
    }
  }, [isAgentOnline, isOnlinePayment])

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
        ) : isOnlinePayment ? (
          <div className="w-18 h-18 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
            <Printer className="w-9 h-9 stroke-[2.2] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
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
              ? isOnlinePayment
                ? 'Print Complete! 🎉'
                : 'Cash Approved & Printed! 🎉'
              : printStatus === 'CANCELLED'
              ? 'Order Cancelled ❌'
              : isOnlinePayment
              ? 'Payment Verified! Auto-Printing 🖨️'
              : printStatus === 'WAITING_COUNTER_APPROVAL'
              ? 'Pay Cash at Counter 💵'
              : printStatus === 'QUEUED_IN_CLOUD'
              ? 'Job Queued in Cloud ☁️'
              : 'Auto-Printing Your Document...'}
          </h2>
          <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-sm">
            {printStatus === 'COMPLETED'
              ? isOnlinePayment
                ? 'Your payment was verified and document has printed! Please collect your fresh printout.'
                : 'Cash payment approved by shopkeeper and printed! Please collect your fresh printout.'
              : printStatus === 'CANCELLED'
              ? 'This print order was cancelled or rejected by the shopkeeper at the counter.'
              : isOnlinePayment
              ? `₹${totalAmount} received successfully via Online Payment. Document is printing directly on the shop printer.`
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
            <span>Payment Mode</span>
            <span className={`font-bold flex items-center gap-1 ${isOnlinePayment ? 'text-emerald-700' : 'text-amber-800'}`}>
              {isOnlinePayment ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Online Paid (UPI / Card)
                </>
              ) : (
                'Cash at Counter'
              )}
            </span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>Pages & Copies</span>
            <span className="text-stone-900 font-bold">
              {selectedPagesCount} {selectedPagesCount === 1 ? 'Page' : 'Pages'} · {copies} {copies === 1 ? 'Set' : 'Sets'} ({colorType === 'COLOR' ? 'Color' : 'B&W'})
            </span>
          </div>

          <div className="flex justify-between border-t border-stone-200/80 pt-2 text-stone-900 font-extrabold text-sm">
            <span>
              {isOnlinePayment
                ? printStatus === 'COMPLETED'
                  ? 'Total Amount Paid (Online)'
                  : 'Amount Paid Online (Verified)'
                : printStatus === 'COMPLETED'
                ? 'Cash Paid at Counter'
                : 'Amount to Pay at Counter'}
            </span>
            <span
              className={`${
                isOnlinePayment || printStatus === 'COMPLETED'
                  ? 'text-emerald-600'
                  : printStatus === 'CANCELLED'
                  ? 'text-rose-600 line-through'
                  : 'text-amber-700'
              } font-heading font-extrabold text-base`}
            >
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Timeline Progress List */}
        <div className="w-full bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col gap-2.5 text-left text-xs font-bold">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'CANCELLED'
                ? 'text-rose-700'
                : isOnlinePayment || printStatus === 'COMPLETED'
                ? 'text-emerald-700'
                : 'text-amber-700 font-extrabold'
            }`}
          >
            {printStatus === 'CANCELLED' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : isOnlinePayment || printStatus === 'COMPLETED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            )}
            <span>
              {printStatus === 'CANCELLED'
                ? `1. Counter Payment Denied (₹${totalAmount})`
                : isOnlinePayment
                ? `1. Online Payment Verified (₹${totalAmount})`
                : printStatus === 'COMPLETED'
                ? `1. Cash Paid at Counter (₹${totalAmount})`
                : `1. Pay ₹${totalAmount} Cash at Counter`}
            </span>
          </div>

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'COMPLETED' || printStatus === 'PRINTING' || (isOnlinePayment && printStatus === 'DISPATCHED_TO_AGENT')
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
            ) : printStatus === 'COMPLETED' || printStatus === 'PRINTING' || (isOnlinePayment && printStatus === 'DISPATCHED_TO_AGENT') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : printStatus === 'WAITING_COUNTER_APPROVAL' ? (
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-stone-300 shrink-0" />
            )}
            <span>
              {printStatus === 'CANCELLED'
                ? '2. Order Rejected by Shopkeeper'
                : isOnlinePayment
                ? printStatus === 'COMPLETED' || printStatus === 'PRINTING'
                  ? '2. Dispatched to Printer Hardware'
                  : '2. Routing to Printer Agent'
                : printStatus === 'COMPLETED'
                ? '2. Approved by Shopkeeper'
                : '2. Waiting for Shopkeeper Approval'}
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2.5 ${
              printStatus === 'PRINTING' || printStatus === 'COMPLETED'
                ? 'text-emerald-700'
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
