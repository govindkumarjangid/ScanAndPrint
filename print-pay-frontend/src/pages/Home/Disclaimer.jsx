import React from 'react'
import { ShieldCheck, Info } from 'lucide-react'

// LAWYER REVIEW NOTICE: The legal disclaimer text provided here is placeholder legal text for marketing and frontend demonstration purposes. A licensed attorney should review and finalize all legal terms, privacy policies, and disclaimers before production deployment.

export default function Disclaimer() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-[900px] mx-auto w-full">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm flex flex-col gap-8">
        
        {/* Title */}
        <div className="border-b border-stone-200 pb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#F0245C] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Legal & Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            Terms, Privacy & Disclaimer
          </h1>
          <p className="text-stone-500 text-xs">Last updated: January 2026</p>
        </div>

        {/* Legal Comment Notice Callout */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Note for Platform Owner:</strong> Standard placeholder disclaimer copy below. Please ensure your legal counsel reviews all terms, privacy guidelines, and refund policies before going live.
          </span>
        </div>

        {/* Content sections */}
        <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-6">
          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-2">1. Overview & Service Scope</h2>
            <p>
              "QR Se Print" provides automated printing agent software designed to facilitate self-service document printing at participating retail shop centers, cyber cafés, and digital services points.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-2">2. Document Privacy & Auto-Deletion</h2>
            <p>
              All customer-uploaded files are processed solely for the purpose of completing the physical print job. Files are automatically removed from local print agent cache upon print completion. Neither QR Se Print nor store owners permanently store end-user document content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-2">3. Payments & Refund Policy</h2>
            <p>
              Shop owners collect fees per printed page based on their configured rates. Plan subscriptions (Monthly or One-Time) entitle shop owners to platform software licenses and support assistance as described in the Pricing schedule.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-2">4. Limitation of Liability</h2>
            <p>
              QR Se Print shall not be held liable for hardware malfunctions of local printers, paper jams, or power outages at retail shop locations. Shop owners are responsible for maintaining hardware operational readiness.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-2">5. Support & Business Contact</h2>
            <p>
              For legal inquiries, technical support, or terms clarification, please contact our support desk at{' '}
              <a href="mailto:qrseprint@gmail.com" className="text-[#F0245C] font-semibold underline">
                qrseprint@gmail.com
              </a>{' '}
              or via helpline at <strong>+91 84048 32414</strong>.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
