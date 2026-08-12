import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowRight, Zap, Clock, pricingFaqItems } from '../../assets/assets'
import Accordion from "../../components/ui/Accordion"
import DemoRegisterModal from '../../components/pricing/DemoRegisterModal'
import { useAuthStore } from '../../store/useAuthStore'

export default function Pricing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const { publicSettings, fetchPublicSettings } = useAuthStore()
  
  // Set fallback pricing if store data hasn't loaded
  const pricing = publicSettings || { monthlyPrice: 399, lifetimePrice: 599 }

  useEffect(() => {
    fetchPublicSettings()
  }, [fetchPublicSettings])

  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Simple & Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight font-heading">
          Choose the <span className="marker-highlight text-stone-900">Best Plan</span> for Your Shop
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          No hidden fees. Unlimited printing support. Soft pricing built specifically for Indian shop owners.
        </p>
      </div>

      {/* Column Plan Cards Grid */}
      <div className={`grid grid-cols-1 gap-6 sm:gap-8 w-full items-stretch ${pricing.demoMode ? 'lg:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>

        {/* 2-HOUR FREE DEMO TRIAL CARD (Conditional) */}
        {pricing.demoMode && (
          <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-7 border-2 border-amber-400 shadow-amber-100 shadow-md flex flex-col justify-between relative bg-linear-to-b from-amber-50/40 to-white overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-amber-400 text-white text-shadow-xs font-extrabold text-[11px] uppercase px-3.5 py-1 rounded-bl-2xl flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> 2-Hour Trial
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Free Trial</span>
                <h3 className="text-2xl font-extrabold text-stone-900 font-heading">2-Hour Demo</h3>
              </div>
            </div>

            <p className="text-stone-500 text-xs sm:text-sm mb-6">
              "Experience full owner dashboard, live kiosk & print agent for 2 hours free"
            </p>

            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-extrabold text-stone-900">₹0</span>
              <span className="text-stone-500 font-semibold text-xs">/ 2 hours access</span>
            </div>

            <div className="space-y-3 mb-6 border-t border-stone-100 pt-5 text-xs font-medium text-stone-700">
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Full Owner Dashboard Access</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Customer Kiosk with Live QR</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Desktop Print Agent Setup</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Test Live Printing Workflow</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Zero Upfront Card Needed</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="btn btn-outline w-full py-3.5 bg-amber-400! hover:bg-amber-500! text-white! font-bold text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Zap className="w-4 h-4 text-amber-100 fill-amber-100" />
            <span className="text-shadow-xs" >Start 2-Hour Demo (₹0)</span>
          </button>
        </motion.div>
        )}

        {/* MONTHLY PLAN CARD */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-7 border-2 border-emerald-600 shadow-emerald-100 shadow-md flex flex-col justify-between relative overflow-hidden bg-linear-to-b from-emerald-50/25 to-white"
        >
          <div className="absolute top-0 right-0 bg-emerald-600 text-white font-extrabold text-[11px] uppercase px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1 text-shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-3" /> Pay Monthly
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Plan 1</span>
                <h3 className="text-2xl font-extrabold text-stone-900 font-heading">Monthly Plan</h3>
              </div>
            </div>

            <p className="text-stone-500 text-xs sm:text-sm mb-6">
              "Pay monthly on time to keep your automated printing active"
            </p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-stone-900">₹{pricing.monthlyPrice}</span>
              <span className="text-stone-500 font-semibold text-xs">/month</span>
            </div>

            <div className="space-y-3 mb-6 border-t border-stone-100 pt-5 text-xs font-medium text-stone-700">
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Auto Print Software</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Personalized Shop QR Code</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Unlimited Printouts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Setup Assistance</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Dedicated WhatsApp Support</span>
              </div>
            </div>
          </div>

          <Link to="/register?plan=monthly" className="flex justify-center mt-2 w-full">
            <button className="btn btn-secondary bg-emerald-600! hover:bg-emerald-700! text-white! w-full py-3.5 text-xs font-bold cursor-pointer text-shadow-xs">
              Choose Monthly (₹{pricing.monthlyPrice})
            </button>
          </Link>
        </motion.div>

        {/* ONE-TIME LIFETIME PLAN CARD (BEST VALUE) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-7 border-2 border-brand shadow-brand/10 shadow-xl flex flex-col justify-between relative overflow-hidden bg-linear-to-b from-rose-50/30 to-white"
        >
          <div className="absolute top-0 right-0 bg-brand text-white font-bold text-[11px] uppercase px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1 text-shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> Best Value
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">Plan 2 · Lifetime</span>
                <h3 className="text-2xl font-extrabold text-stone-900 font-heading">One-Time Plan</h3>
              </div>
            </div>

            <p className="text-stone-500 text-xs sm:text-sm mb-6">
              "One-time payment — Lifetime Access & Updates — Zero renewal fees ever"
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-stone-400 line-through text-base font-bold">₹3,999</span>
              <span className="text-4xl font-extrabold text-brand">₹{pricing.lifetimePrice}</span>
              <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300">
                Lifetime Free
              </span>
            </div>

            <div className="space-y-3 mb-6 border-t border-stone-100 pt-5 text-xs font-medium text-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Auto Print Software (Lifetime)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>High-Res Acrylic QR Poster</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>Unlimited Printouts & Zero Fees</span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>Priority Setup & WhatsApp Support</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-3" />
                </div>
                <span>AnyDesk Remote Setup Help</span>
              </div>
            </div>
          </div>

          <Link to="/register?plan=onetime" className="flex justify-center mt-2 w-full">
            <button className="btn btn-primary w-full py-3.5 shadow-lg flex items-center justify-center gap-2 text-xs font-bold cursor-pointer">
              <span className="text-shadow-xs" >Get Lifetime Plan (₹{pricing.lifetimePrice})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>

      </div>

      {/* PRICING FAQ SECTION */}
      <div id="faq" className="max-w-3xl mx-auto w-full pt-10 border-t border-stone-200">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 font-heading">
            Pricing & Subscription <span className="marker-highlight text-stone-900">FAQ</span>
          </h2>
          <p className="text-stone-500 text-sm mt-1">Everything you need to know about billing, renewals, and lifetime updates</p>
        </div>

        <Accordion items={pricingFaqItems} />

        <div className="mt-12 text-center bg-stone-100 p-8 rounded-3xl border border-stone-200">
          <h3 className="font-extrabold text-stone-900 text-xl font-heading">Ready to Increase Your Shop's Revenue?</h3>
          <p className="text-stone-600 text-sm mt-1 mb-6">Registration takes less than 2 minutes!</p>
          <Link to="/register">
            <button className="btn btn-primary btn-lg">
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Quick 2-Hour Demo Registration Modal */}
      <DemoRegisterModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  )
}
