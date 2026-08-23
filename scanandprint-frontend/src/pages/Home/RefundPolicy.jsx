import React from 'react'
import { Link } from 'react-router'
import SEO from '../../components/common/SEO'
import { IndianRupee, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, Phone, Mail } from '../../assets/assets'
import { useAuthStore } from '../../store/useAuthStore'

export default function RefundPolicy() {
  const { publicSettings } = useAuthStore()
  const monthlyPrice = publicSettings?.monthlyPrice || 299
  const yearlyPrice = publicSettings?.yearlyPrice || 799
  const supportEmail = publicSettings?.supportEmail || 'scanqrandprint@gmail.com'
  const supportPhone = publicSettings?.supportPhone || '+91 7073904473'
  const rawPhone = supportPhone.replace(/[^\d]/g, '')
  const waNumber = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
  return (
    <div className="py-12 px-4 sm:px-6 max-w-240 mx-auto w-full font-sans">
      <SEO path="/refund-policy" />
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm flex flex-col gap-8">

        {/* Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3.5 py-1 rounded-full w-max border border-emerald-200">
            <RefreshCw className="w-3.5 h-3.5" /> Fair Refund Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Scan&Print <span className="marker-highlight text-stone-900">Refund Policy</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Effective Date: January 1, 2026 · Last Updated: August 2026
          </p>
        </div>

        {/* 7-Day Money Back Guarantee Banner */}
        <div className="bg-linear-to-r from-amber-500 to-amber-600 text-stone-900 p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md">
              7
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 font-heading">
                7-Day Money-Back Guarantee for Shop Owners
              </h3>
              <p className="text-stone-800 text-xs sm:text-sm font-medium">
                Try Scan&Print risk-free. If setup fails on your PC, get a 100% no-questions-asked refund!
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${waNumber}?text=Hello%20Scan%26Print%2C%20I%20want%20to%20request%20a%20refund`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            <button className="btn btn-primary bg-stone-900! hover:bg-stone-800! px-5 shadow-md">
              Claim Refund
            </button>
          </a>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">

          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">1.</span> Shop Owner Subscription Refunds (Monthly &amp; Yearly)
            </h2>
            <p className="text-stone-600">
              We stand behind the reliability of Scan&amp;Print software. If you register your shop under either the <strong>Monthly (₹{monthlyPrice})</strong> or <strong>Yearly (₹{yearlyPrice})</strong> plan:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 mt-1">
              <li>
                <strong>Full Refund Eligibility:</strong> If the Print Agent software is incompatible with your Windows PC or fails to auto-print after remote setup assistance within <strong>7 days</strong> of purchase, you are eligible for a 100% full refund.
              </li>
              <li>
                <strong>No Renewal Lock-in:</strong> Monthly subscriptions (₹{monthlyPrice}/mo) can be cancelled at any time from your Shop Dashboard without cancellation penalties.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">2.</span> Customer Failed Print Job Auto-Refunds
            </h2>
            <p className="text-stone-600">
              When customers scan a counter QR code and complete an online UPI payment:
            </p>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs sm:text-sm text-stone-700">
              <p className="font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Print Hardware Outage Protection:
              </p>
              <p>
                If a customer's online payment is debited but the print job fails due to local hardware issues (such as printer paper jam, ink exhaustion, or shop power failure), the debited amount is automatically reversed to the customer's UPI account within <strong>24 to 48 hours</strong>.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">3.</span> Refund Processing Timeline & Method
            </h2>
            <p className="text-stone-600">
              Approved refunds are credited directly back to the original payment source (UPI ID, Bank Account, or Card) used during the transaction:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 mt-1">
              <li><strong>UPI / GPay / PhonePe / Paytm:</strong> 24 to 48 business hours.</li>
              <li><strong>Net Banking / Debit & Credit Cards:</strong> 3 to 5 business days depending on banking channels.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">4.</span> Non-Refundable Scenarios
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600">
              <li>Refund requests submitted after 7 days from subscription purchase date.</li>
              <li>Subscriptions terminated due to breach of platform terms or fraudulent usage.</li>
              <li>Print jobs successfully printed out at the counter.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">5.</span> How to Request a Refund
            </h2>
            <p className="text-stone-600">
              To submit a refund request, simply contact our support team with your <strong>Shop ID</strong> or <strong>Payment Transaction Reference Number</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <a
                href={`https://wa.me/${waNumber}?text=Refund%20Request%20for%20Scan%26Print`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 hover:bg-emerald-100/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-400">WhatsApp Support</span>
                  <p className="font-extrabold text-stone-900 text-sm">{supportPhone}</p>
                </div>
              </a>

              <a
                href={`mailto:${supportEmail}?subject=Refund%20Request`}
                className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 hover:bg-rose-100/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-400">Email Support</span>
                  <p className="font-extrabold text-stone-900 text-sm">{supportEmail}</p>
                </div>
              </a>
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
            <Link to="/disclaimer" className="hover:text-brand transition-colors">
              Disclaimer
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
