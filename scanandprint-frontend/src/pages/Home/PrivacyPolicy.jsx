import React from 'react'
import { Link } from 'react-router'
import { ShieldCheck, Lock, EyeOff, Server, FileText, CheckCircle2, ArrowRight } from '../../assets/assets'

export default function PrivacyPolicy() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-240 mx-auto w-full font-sans">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm flex flex-col gap-8">

        {/* Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 px-3.5 py-1 rounded-full w-max border border-rose-200">
            <Lock className="w-3.5 h-3.5" /> Privacy & Security Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Scan&Print <span className="marker-highlight text-stone-900">Privacy Policy</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Effective Date: January 1, 2026 · Last Updated: August 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-5 rounded-2xl flex items-start gap-4 text-emerald-900 text-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <EyeOff className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-base text-emerald-950">100% Data Privacy Guarantee</span>
            <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
              Customer document security is our top priority. Files uploaded by customers via counter QR code are used <strong>exclusively for printing</strong> and are <strong>permanently auto-deleted</strong> immediately after the print command completes. We never store, read, or sell customer documents.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">

          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">1.</span> Information We Collect
            </h2>
            <p className="text-stone-600">
              To operate the Scan&Print platform for shop owners and customers, we collect minimal operational information:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 mt-1">
              <li>
                <strong>Shop Owner Information:</strong> Name, Business Shop Name, Email Address, Mobile Number, Shop Address, Pincode, and Printer Configuration settings.
              </li>
              <li>
                <strong>Customer Temporary Uploads:</strong> Files (PDFs, Images, Word documents) uploaded via the browser-based QR kiosk solely for printing execution.
              </li>
              <li>
                <strong>Transaction Metadata:</strong> Payment reference ID, print job count, total page count, color/B&W type, and timestamp (excluding payment card or banking details).
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">2.</span> How We Use Your Information
            </h2>
            <p className="text-stone-600">
              We process data strictly for operational, support, and billing purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 mt-1">
              <li>To route online print jobs directly from customer mobile devices to the local shop printer agent.</li>
              <li>To issue customized counter QR codes containing unique Shop IDs.</li>
              <li>To process shop owner subscription renewals (Monthly ₹399 / Lifetime ₹599).</li>
              <li>To provide 1-on-1 technical assistance via WhatsApp and AnyDesk remote support.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">3.</span> Automatic Document Deletion & Storage Policy
            </h2>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs sm:text-sm text-stone-700">
              <p className="font-semibold text-stone-900">
                Automatic Cache Wiping Workflow:
              </p>
              <p>
                1. Customer uploads file → 2. File encrypted in transient memory → 3. Print Agent executes local printer job → 4. File permanently purged from memory and cache.
              </p>
              <p className="text-stone-500 text-xs">
                No human, shop owner, or administrator can view or retrieve customer files after the job is completed or cancelled.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">4.</span> Payment Gateway Security
            </h2>
            <p className="text-stone-600">
              All digital UPI payments (Google Pay, PhonePe, Paytm, BHIM) are securely processed via RBI-authorized payment gateways using 256-bit SSL encryption. Scan&Print does not store debit/credit card numbers, UPI PINs, or net banking credentials.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">5.</span> Data Sharing & Third-Party Disclosure
            </h2>
            <p className="text-stone-600">
              We never sell, rent, or trade your personal or business data to third-party advertisers. Data is shared only with trusted infrastructure providers (such as cloud hosting and SMS/WhatsApp gateway APIs) strictly necessary to run the service.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">6.</span> Contact Our Privacy Officer
            </h2>
            <p className="text-stone-600">
              If you have any privacy concerns or questions regarding data protection, please write to us at:
            </p>
            <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-2xl text-xs sm:text-sm text-stone-800 flex flex-col gap-1">
              <span className="font-bold text-stone-900">Scan&Print Privacy Desk</span>
              <span>Email: <a href="mailto:qrseprint@gmail.com" className="text-brand font-bold underline">qrseprint@gmail.com</a></span>
              <span>Phone / WhatsApp Support: <strong>+91 84048 32414</strong></span>
              <span>Address: Main Market, Digital Hub, India</span>
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
            <Link to="/refund-policy" className="hover:text-brand transition-colors">
              Refund Policy
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
