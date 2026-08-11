import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Globe, Banknote, Save, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPaymentSetup() {
  const { currentShop, updatePaymentSettings, isSavingPayment } = useAuthStore()

  const [paymentMode, setPaymentMode] = useState(currentShop?.paymentSettings?.paymentMode || 'online_counter')
  const [paymentGateway, setPaymentGateway] = useState(currentShop?.paymentSettings?.paymentGateway || 'razorpay')
  const [razorpayKeyId, setRazorpayKeyId] = useState(currentShop?.paymentSettings?.razorpayKeyId || '')
  const [cashfreeAppId, setCashfreeAppId] = useState(currentShop?.paymentSettings?.cashfreeAppId || '')

  useEffect(() => {
    if (currentShop?.paymentSettings) {
      if (currentShop.paymentSettings.paymentMode) setPaymentMode(currentShop.paymentSettings.paymentMode)
      if (currentShop.paymentSettings.paymentGateway) setPaymentGateway(currentShop.paymentSettings.paymentGateway)
      if (currentShop.paymentSettings.razorpayKeyId) setRazorpayKeyId(currentShop.paymentSettings.razorpayKeyId)
      if (currentShop.paymentSettings.cashfreeAppId) setCashfreeAppId(currentShop.paymentSettings.cashfreeAppId)
    }
  }, [currentShop])

  const handleSave = async (e) => {
    e.preventDefault()
    await updatePaymentSettings({
      paymentMode,
      paymentGateway,
      razorpayKeyId,
      cashfreeAppId,
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Top Banner */}
      <div className="bg-emerald-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
        <div className="bg-emerald-500/50 p-3 rounded-2xl mb-3">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Payment Setup
        </h1>
        <p className="text-emerald-100 text-sm mt-1 font-medium max-w-md">
          How you'll take money from customers — counter, online or both
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* PAYMENT MODE SECTION */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 ml-1">
            Payment Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* ONLINE + COUNTER */}
            <label 
              onClick={() => setPaymentMode('online_counter')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'online_counter' 
                  ? 'border-brand bg-gradient-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10' 
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              {/* Radio button at top right corner */}
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'online_counter' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'online_counter' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>
              
              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'online_counter' ? 'bg-brand/10' : 'bg-blue-50 group-hover:bg-blue-100/80'}`}>
                <CreditCard className={`w-6 h-6 ${paymentMode === 'online_counter' ? 'text-brand' : 'text-blue-500'}`} />
              </div>
              
              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'online_counter' ? 'text-stone-900' : 'text-stone-700'}`}>ONLINE + COUNTER</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">THE CUSTOMER GETS BOTH OPTIONS</span>
              </div>
            </label>

            {/* ONLINE ONLY */}
            <label 
              onClick={() => setPaymentMode('online')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'online' 
                  ? 'border-brand bg-gradient-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10' 
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'online' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'online' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>
              
              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'online' ? 'bg-brand/10' : 'bg-cyan-50 group-hover:bg-cyan-100/80'}`}>
                <Globe className={`w-6 h-6 ${paymentMode === 'online' ? 'text-brand' : 'text-cyan-500'}`} />
              </div>
              
              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'online' ? 'text-stone-900' : 'text-stone-700'}`}>ONLINE ONLY</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">ONLINE PAYMENT ONLY, NO COUNTER</span>
              </div>
            </label>

            {/* COUNTER ONLY */}
            <label 
              onClick={() => setPaymentMode('counter')}
              className={`relative flex flex-row items-center justify-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out text-left group ${
                paymentMode === 'counter' 
                  ? 'border-brand bg-gradient-to-br from-rose-50/80 to-rose-100/30 shadow-[0_4px_20px_rgb(225,29,72,0.12)] scale-[1.02] ring-4 ring-brand/10' 
                  : 'border-stone-200/70 bg-white hover:border-stone-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'
              }`}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors duration-300 ${
                  paymentMode === 'counter' ? 'border-brand bg-white' : 'border-stone-300 group-hover:border-stone-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${paymentMode === 'counter' ? 'bg-brand scale-100' : 'bg-transparent scale-0'}`} />
                </div>
              </div>
              
              <div className={`shrink-0 p-3.5 rounded-xl transition-colors duration-300 ${paymentMode === 'counter' ? 'bg-brand/10' : 'bg-emerald-50 group-hover:bg-emerald-100/80'}`}>
                <Banknote className={`w-6 h-6 ${paymentMode === 'counter' ? 'text-brand' : 'text-emerald-500'}`} />
              </div>
              
              <div className="flex flex-col gap-0.5 pr-8">
                <span className={`font-extrabold text-sm transition-colors duration-300 ${paymentMode === 'counter' ? 'text-stone-900' : 'text-stone-700'}`}>COUNTER ONLY</span>
                <span className="text-[11px] text-stone-500 font-medium leading-snug">CASH AT THE COUNTER ONLY</span>
              </div>
            </label>

          </div>
        </div>

        {/* PAYMENT GATEWAY SECTION */}
        {(paymentMode === 'online_counter' || paymentMode === 'online') && (
          <div className="flex flex-col gap-4 mt-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 ml-1">
              Payment Gateway
            </label>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentGateway('razorpay')}
                className={`flex-1 btn ${
                  paymentGateway === 'razorpay'
                    ? 'btn-outline !border-brand !text-brand !bg-rose-50'
                    : 'btn-outline !border-stone-200 text-stone-600 hover:!bg-stone-100'
                }`}
              >
                Razorpay
              </button>
              <button
                type="button"
                onClick={() => setPaymentGateway('cashfree')}
                className={`flex-1 btn ${
                  paymentGateway === 'cashfree'
                    ? 'btn-outline !border-brand !text-brand !bg-rose-50'
                    : 'btn-outline !border-stone-200 text-stone-600 hover:!bg-stone-100'
                }`}
              >
                Cashfree
              </button>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 flex flex-col gap-5">
              
              <div className="flex items-center justify-between text-brand text-sm font-bold bg-white p-3 rounded-lg border border-stone-200 shadow-xs">
                <span>📖 How to Get the Keys? (Standard API Key Credentials)</span>
              </div>

              {paymentGateway === 'razorpay' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_live_xxxxxxxxx"
                    className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors"
                  />
                </div>
              )}

              {paymentGateway === 'cashfree' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                    Cashfree App ID
                  </label>
                  <input
                    type="text"
                    value={cashfreeAppId}
                    onChange={(e) => setCashfreeAppId(e.target.value)}
                    placeholder="1234567890abcdef"
                    className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors"
                  />
                </div>
              )}

            </div>
          </div>
        )}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSavingPayment}
            className="btn btn-primary py-4 mt-4 px-8 flex items-center gap-2"
          >
            {isSavingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingPayment ? 'Saving Payment Settings...' : 'Save Payment Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}

