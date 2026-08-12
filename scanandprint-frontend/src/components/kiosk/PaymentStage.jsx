import React from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowLeft,
  Lock,
} from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import toast from 'react-hot-toast'

export default function PaymentStage({
  selectedFile,
  totalPages,
  colorType,
  totalAmount,
  customerPhone,
  onBack,
  onPaymentSuccess,
  getJobFormData,
}) {
  const {
    isRazorpayLoading,
    isVerifyingPayment,
    initiateRazorpayPayment,
    bypassPaymentDemo,
  } = useKioskStore()

  const isBusy = isRazorpayLoading || isVerifyingPayment

  // 1. Handle Native Razorpay Payment (UPI: PhonePe, GPay, Paytm, Cards)
  const handleRazorpayPay = async () => {
    try {
      const formData = getJobFormData()
      await initiateRazorpayPayment({
        formData,
        totalAmount,
        customerPhone,
      })
      onPaymentSuccess()
    } catch (err) {
      console.warn('Razorpay checkout note:', err.message)
    }
  }

  // 2. Handle Instant Demo Mode Bypass (for testing)
  const handleDemoBypass = async () => {
    try {
      const formData = getJobFormData()
      await bypassPaymentDemo(formData)
      toast.success('⚡ Demo Mode: Payment bypassed successfully!')
      onPaymentSuccess()
    } catch (err) {
      toast.error('Failed to bypass demo payment')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 max-w-md mx-auto w-full"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isBusy}
          className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Options</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xl flex flex-col gap-6 text-center">
        {/* Header Icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/10 font-bold">
            <Smartphone className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
            Pay ₹{totalAmount} Online
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Instant 1-Click Payment via Google Pay, PhonePe, Paytm or UPI
          </p>
        </div>

        {/* Order Summary Box */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left flex flex-col gap-2.5 text-xs font-semibold">
          <div className="flex justify-between text-stone-600">
            <span>Document</span>
            <span className="text-stone-900 font-bold truncate max-w-45">
              {selectedFile?.name || 'Document.pdf'}
            </span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Print Specs</span>
            <span className="text-stone-900 font-bold">
              {totalPages} pgs · {colorType === 'COLOR' ? 'Color' : 'B&W'}
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-200/80 pt-2 text-stone-900 font-extrabold text-sm">
            <span>Total Amount</span>
            <span className="text-brand text-base">₹{totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Main Razorpay Payment Button */}
          <button
            type="button"
            onClick={handleRazorpayPay}
            disabled={isBusy}
            className="btn btn-primary w-full py-4 bg-stone-900! hover:bg-black! shadow-lg flex items-center justify-center gap-2 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-brand" />
                <span>Processing Razorpay Checkout...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Pay ₹{totalAmount} (PhonePe / GPay / Paytm)</span>
              </>
            )}
          </button>

          {/* Demo Mode Bypass Button */}
          <button
            type="button"
            onClick={handleDemoBypass}
            disabled={isBusy}
            className="btn btn-outline w-full py-2.5 text-amber-700! bg-amber-50! hover:bg-amber-100! border-amber-200! flex items-center justify-center gap-2 text-xs font-bold"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>⚡ Instant Demo Bypass (Test Print)</span>
          </button>

          {/* Trust Banner */}
          <div className="text-[11px] text-stone-400 font-medium flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Encrypted & Safe Razorpay Payment</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
