import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Zap,
  Loader2,
  ArrowLeft,
  Lock,
  CreditCard,
  Banknote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import toast from 'react-hot-toast'

export default function PaymentStage({
  shopInfo,
  selectedFile,
  selectedPagesCount,
  colorType,
  copies,
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
    payAtCounter,
    bypassPaymentDemo,
  } = useKioskStore()

  // Payment Mode from Owner's Settings
  const paymentMode = shopInfo?.paymentSettings?.paymentMode || 'online_counter'
  const isDemoAccount = Boolean(shopInfo?.isDemoAccount)
  
  // Tabs: 'online' vs 'counter'
  const initialTab = paymentMode === 'counter' ? 'counter' : 'online'
  const [activeTab, setActiveTab] = useState(initialTab)

  const isBusy = isRazorpayLoading || isVerifyingPayment

  // 1. Handle Online Razorpay Checkout
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

  // 2. Handle Cash at Counter Order
  const handleCounterPay = async () => {
    try {
      const formData = getJobFormData()
      formData.append('paymentMethod', 'CASH_COUNTER')
      await payAtCounter(formData)
      toast.success('Order placed! Please pay at counter.')
      onPaymentSuccess()
    } catch (err) {
      toast.error('Failed to submit counter print job')
    }
  }

  // 3. Handle Free Demo Bypass (For testing)
  const handleDemoBypass = async () => {
    try {
      const formData = getJobFormData()
      await bypassPaymentDemo(formData)
      toast.success('⚡ Free Demo Print: Spooled directly to printer!')
      onPaymentSuccess()
    } catch (err) {
      toast.error('Failed to dispatch demo print')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 max-w-md mx-auto w-full"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isBusy}
          className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Options</span>
        </button>

        <span className="text-[11px] font-bold text-stone-500">
          Step 3 of 4: Payment
        </span>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xl flex flex-col gap-5 text-center">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-13 h-13 rounded-2xl bg-linear-to-br from-brand to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 font-bold">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heading">
            Pay ₹{totalAmount}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {activeTab === 'online'
              ? 'Pay Online via UPI, Cards & NetBanking'
              : 'Pay Cash to Shopkeeper at Counter'}
          </p>
        </div>

        {/* Payment Mode Switcher Tabs (If owner enabled Online + Counter) */}
        {paymentMode === 'online_counter' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 border border-stone-200 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('online')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-brand" />
              <span>Online Payment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('counter')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'counter'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash at Counter</span>
            </button>
          </div>
        )}

        {/* Order Summary Box */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-left flex flex-col gap-2 text-xs font-semibold">
          <div className="flex justify-between text-stone-600">
            <span>Document</span>
            <span className="text-stone-900 font-bold truncate max-w-40">
              {selectedFile?.name || 'Document.pdf'}
            </span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Print Specs</span>
            <span className="text-stone-900 font-bold">
              {selectedPagesCount} {selectedPagesCount === 1 ? 'pg' : 'pgs'} × {copies} {copies === 1 ? 'copy' : 'copies'} ({colorType === 'COLOR' ? 'Color' : 'B&W'})
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-200/80 pt-2 text-stone-900 font-extrabold text-sm">
            <span>Total Payable</span>
            <span className="text-brand text-base font-heading">₹{totalAmount}</span>
          </div>
        </div>

        {/* Action Content based on activeTab */}
        <div className="flex flex-col gap-3.5">
          
          {/* ONLINE PAYMENT MODE */}
          {activeTab === 'online' && (
            <div className="flex flex-col gap-3">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 text-left flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-rose-950">
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                  <span>Supported Payment Methods</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white text-stone-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                    UPI (GPay / PhonePe / Paytm / CRED)
                  </span>
                  <span className="bg-white text-stone-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                    Debit & Credit Cards
                  </span>
                  <span className="bg-white text-stone-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                    NetBanking & Wallets
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  Instant automated print job dispatch upon payment confirmation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRazorpayPay}
                disabled={isBusy}
                className="w-full py-4 px-6 rounded-2xl bg-brand hover:bg-rose-600 active:scale-[0.99] text-white flex items-center justify-center gap-2.5 text-sm sm:text-base font-extrabold shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Connecting Securely...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>Pay ₹{totalAmount} Online</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* CASH COUNTER PAYMENT MODE */}
          {activeTab === 'counter' && (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 text-left flex items-start gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex flex-col text-xs text-emerald-900">
                  <span className="font-extrabold">Pay ₹{totalAmount} at Shop Counter</span>
                  <span className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Click below to send print job to queue. Pay ₹{totalAmount} cash to the shopkeeper when collecting printouts.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCounterPay}
                disabled={isBusy}
                className="btn btn-primary w-full py-3.5 bg-emerald-600! hover:bg-emerald-700! shadow-lg flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
              >
                {isBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Print (Pay ₹{totalAmount} at Counter)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Free Demo Bypass Button (When Shop is Demo Account) */}
          {isDemoAccount && (
            <button
              type="button"
              onClick={handleDemoBypass}
              disabled={isBusy}
              className="btn btn-outline w-full py-2.5 text-amber-700! bg-amber-50! hover:bg-amber-100! border-amber-200! flex items-center justify-center gap-2 text-xs font-bold rounded-2xl cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>⚡ Free Demo Test Print (₹0)</span>
            </button>
          )}

          {/* Trust Banner */}
          <div className="text-[11px] text-stone-400 font-medium flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-Bit Encrypted & Instant Hardware Routing</span>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
