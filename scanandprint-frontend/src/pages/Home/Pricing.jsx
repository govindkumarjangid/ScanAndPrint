import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowRight, Zap, pricingFaqItems } from '../../assets/assets'
import Accordion from "../../components/ui/Accordion"

export default function Pricing() {
  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-300 mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Simple & Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Choose the <span className="marker-highlight text-stone-900">Best Plan</span> for Your Shop
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          No hidden fees. Unlimited printing support. Soft pricing built specifically for Indian shop owners.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full items-stretch">

        {/* Monthly Plan Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col justify-between relative"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Plan 1</span>
                <h3 className="text-2xl font-extrabold text-stone-900">Monthly Plan</h3>
              </div>
              <span className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1 rounded-full border border-stone-200">
                Pay Monthly
              </span>
            </div>

            <p className="text-stone-500 text-sm mb-6">
              "Pay monthly on time to keep your automated printing active"
            </p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-stone-900">₹399</span>
              <span className="text-stone-500 font-semibold text-sm">/month</span>
            </div>

            <div className="space-y-3.5 mb-8 border-t border-stone-100 pt-6 text-sm text-stone-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Auto Print Software</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Personalized Shop QR Code</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Unlimited Printouts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Setup Assistance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>On-Demand Service Additions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Continuous Updates & Bug Fixes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Dedicated WhatsApp Support</span>
              </div>
            </div>
          </div>

          <Link to="/register?plan=monthly" className="flex justify-center mt-2">
            <button
              className="btn btn-secondary btn-lg w-auto px-8"
            >
              Choose Monthly (₹399)
            </button>
          </Link>
        </motion.div>

        {/* One-Time Plan Card (Best Value) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-8 border-2 border-brand shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          {/* Best Value Badge */}
          <div className="absolute top-0 right-0 bg-brand text-white font-bold text-xs uppercase px-4 py-1.5 rounded-bl-2xl shadow-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> Best Value (Save 85%)
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">Plan 2 · Lifetime</span>
                <h3 className="text-2xl font-extrabold text-stone-900">One-Time Plan</h3>
              </div>
            </div>

            <p className="text-stone-500 text-sm mb-6">
              "One-time payment — Lifetime Access & Updates — Zero renewal fees ever"
            </p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-stone-400 line-through text-lg font-bold">₹3,999</span>
              <span className="text-4xl font-extrabold text-brand">₹599</span>
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-md border border-amber-300">
                Lifetime Free Updates
              </span>
            </div>

            <div className="space-y-3.5 mb-8 border-t border-stone-100 pt-6 text-sm text-stone-800">
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Auto Print Software</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Personalized Shop QR Code</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Unlimited Printouts</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Setup Assistance</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center shrink-0 font-extrabold">
                  <Zap className="w-3.5 h-3.5 fill-stone-900" />
                </div>
                <span>Payment Gateway Setup Assistant</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center shrink-0 font-extrabold">
                  <Zap className="w-3.5 h-3.5 fill-stone-900" />
                </div>
                <span>Priority 2-Hour Bug Fix</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>Dedicated WhatsApp Support</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-3" />
                </div>
                <span>AnyDesk Remote Support</span>
              </div>
            </div>
          </div>

          <Link to="/register?plan=onetime" className="flex justify-center mt-2">
            <button
              className="btn btn-primary btn-lg w-auto px-8"
            >
              <span>Get Lifetime Plan (₹599)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>

      </div>

      {/* PRICING SPECIFIC FAQ SECTION */}
      <div id="faq" className="max-w-3xl mx-auto w-full pt-10 border-t border-stone-200">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900">
            Pricing & Subscription <span className="marker-highlight text-stone-900">FAQ</span>
          </h2>
          <p className="text-stone-500 text-sm mt-1">Everything you need to know about billing, renewals, and lifetime updates</p>
        </div>

        <Accordion items={pricingFaqItems} />

        <div className="mt-12 text-center bg-stone-100 p-8 rounded-3xl border border-stone-200">
          <h3 className="font-extrabold text-stone-900 text-xl">Ready to Increase Your Shop's Revenue?</h3>
          <p className="text-stone-600 text-sm mt-1 mb-6">Registration takes less than 2 minutes!</p>
          <Link to="/register">
            <button
              className="btn btn-primary btn-lg"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
