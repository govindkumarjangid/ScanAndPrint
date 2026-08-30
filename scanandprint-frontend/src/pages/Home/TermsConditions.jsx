import { Link } from 'react-router'
import SEO from '../../components/common/SEO'
import { FileText, ArrowRight } from '../../assets/assets'
import { useAuthStore } from '../../store/useAuthStore'

export default function TermsConditions() {
  const { publicSettings } = useAuthStore()
  const monthlyPrice = publicSettings?.monthlyPrice || 299
  const yearlyPrice = publicSettings?.yearlyPrice || 799
  const supportEmail = publicSettings?.supportEmail || 'scanqrandprint@gmail.com'
  return (
    <div className="py-12 px-4 sm:px-6 max-w-240 mx-auto w-full font-sans">
      <SEO path="/terms-and-conditions" />
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm flex flex-col gap-8">

        {/* Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 px-3.5 py-1 rounded-full w-max border border-rose-200">
            <FileText className="w-3.5 h-3.5" /> Legal Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Scan&Print <span className="marker-highlight text-stone-900">Terms & Conditions</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Effective Date: January 1, 2026 · Last Updated: August 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-stone-700 text-sm sm:text-base leading-relaxed">

          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">1.</span> Acceptance of Terms
            </h2>
            <p className="text-stone-600">
              Welcome to <strong>Scan&Print</strong> ("Platform", "We", "Us", or "Our"). By accessing our website, registering a cyber café or print shop account, downloading the Print Agent software, or scanning a counter QR code to send print orders, you agree to be bound by these Terms & Conditions.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">2.</span> Service Description
            </h2>
            <p className="text-stone-600">
              Scan&Print provides a smart automated printing ecosystem enabling print shop owners, CSC centers, and digital service centers to accept online document uploads and digital payments (UPI/Cards) directly from customer mobile devices without requiring manual WhatsApp sharing.
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">3.</span> Shop Owner Account & Software License
            </h2>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600">
              <li>
                <strong>License Grant:</strong> Upon purchasing a Monthly (₹{monthlyPrice}) or Yearly (₹{yearlyPrice}) plan, shop owners receive a non-exclusive, non-transferable license to run the Print Agent software on connected Windows computers.
              </li>
              <li>
                <strong>Account Credentials:</strong> Shop owners are responsible for maintaining confidentiality of their Shop ID, email, and password.
              </li>
              <li>
                <strong>Hardware Maintenance:</strong> Shop owners must maintain operational USB/desktop printers, paper supply, and active internet connectivity.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">4.</span> Acceptable Use & Prohibited Content
            </h2>
            <p className="text-stone-600">
              Users agree not to use the platform to transmit or print any content that:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-stone-600 mt-1">
              <li>Infringes upon third-party copyrights, trademarks, or intellectual property rights.</li>
              <li>Contains unlawful, fraudulent, defamatory, or abusive material.</li>
              <li>Contains malicious software, viruses, or code designed to harm computer systems.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">5.</span> Pricing, Billing & Payment Gateway
            </h2>
            <p className="text-stone-600">
              Shop owners configure their customer print rates per page (B&W and Color) in their dashboard. Subscriptions are billed in Indian Rupees (INR) through RBI-regulated payment gateways.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">6.</span> Limitation of Liability
            </h2>
            <p className="text-stone-600">
              Scan&Print shall not be liable for indirect, incidental, or consequential damages resulting from local printer hardware jams, physical machine failures, power outages, or temporary internet disruptions at retail shop locations.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-stone-100 pt-6">
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <span className="text-brand font-mono">7.</span> Governing Law & Legal Contact
            </h2>
            <p className="text-stone-600">
              These Terms shall be governed by and construed in accordance with the laws of India. For any legal inquiries or clarifications, please contact us at <a href={`mailto:${supportEmail}`} className="text-brand font-bold underline">{supportEmail}</a>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-stone-500">
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-brand transition-colors">
              Privacy Policy
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
