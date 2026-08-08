import React from 'react'
import { Link } from 'react-router'
import { ShieldCheck, Info, ArrowRight, Lock, RefreshCw, FileText } from '../../assets/assets'

export default function Disclaimer() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-[960px] mx-auto w-full font-sans">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm flex flex-col gap-8">
        
        {/* Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 px-3.5 py-1 rounded-full w-max border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Legal Disclaimer & Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Scan&Print <span className="marker-highlight text-stone-900">Disclaimer</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Last Updated: August 2026 · Scan&Print Smart Network
          </p>
        </div>

        {/* Legal Notice Box */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-stone-900">Legal Notice:</span>
            <span>
              The information provided on this platform is for general informational and automated print routing purposes. Please read our specific legal policies below for complete details regarding privacy, refunds, and terms of service.
            </span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">
          
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">1.</span> Overview & Service Scope
            </h2>
            <p className="text-stone-600">
              "Scan&Print" operates an automated printing agent software network designed to facilitate mobile document printing at participating retail shop centers, cyber cafés, and digital services points across India.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">2.</span> Independent Retail Operations
            </h2>
            <p className="text-stone-600">
              Retail print shops using Scan&Print operate independently. Scan&Print provides software connectivity, payment processing API integration, and agent routing software. Physical print output quality, paper stock, and local counter availability are maintained by individual shop owners.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">3.</span> Limitation of Hardware & Outage Liability
            </h2>
            <p className="text-stone-600">
              Scan&Print shall not be held liable for local hardware defects, mechanical paper jams, ink exhaustion, or electrical power loss at retail shop premises. In the event of a failed print transaction due to hardware outage, automatic refund safeguards protect the customer.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">4.</span> Dedicated Legal & Policy Links
            </h2>
            <p className="text-stone-600">
              For complete details regarding data protection, subscription refunds, and user obligations, please visit our dedicated policy pages:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <Link
                to="/privacy-policy"
                className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col gap-2 hover:border-brand transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-brand flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-stone-900 text-sm group-hover:text-brand transition-colors">
                  Privacy Policy
                </span>
                <span className="text-xs text-stone-500">Document auto-deletion & data privacy</span>
              </Link>

              <Link
                to="/refund-policy"
                className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col gap-2 hover:border-emerald-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
                  Refund Policy
                </span>
                <span className="text-xs text-stone-500">7-day guarantee & failed job refunds</span>
              </Link>

              <Link
                to="/terms-and-conditions"
                className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col gap-2 hover:border-stone-800 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-stone-900 text-sm group-hover:text-stone-900 transition-colors">
                  Terms & Conditions
                </span>
                <span className="text-xs text-stone-500">Platform license & shop terms</span>
              </Link>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-stone-500">
          <div className="flex items-center gap-4">
            <Link to="/terms-and-conditions" className="hover:text-brand transition-colors">
              Terms & Conditions
            </Link>
            <span>·</span>
            <Link to="/privacy-policy" className="hover:text-brand transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/refund-policy" className="hover:text-brand transition-colors">
              Refund Policy
            </Link>
          </div>
          <Link to="/" className="text-brand flex items-center gap-1 hover:underline">
            <span>Back to Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}
