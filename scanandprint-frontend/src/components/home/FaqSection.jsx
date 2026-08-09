
import { HelpCircle, MessageSquare, ArrowRight, Printer, faqItems } from '../../assets/assets'
import { Link } from 'react-router'
import Accordion from '../ui/Accordion'

export default function FaqSection() {

  return (
    <section className="px-4 sm:px-6 max-w-300 mx-auto w-full py-8 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12 gap-3.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300/70 text-amber-900 text-xs font-bold shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-brand" />
          <span>Frequently Asked Questions</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          Everything You Need to Know About <span className="marker-highlight text-stone-900">Scan&Print</span>
        </h2>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          Quick answers to common questions about existing printer compatibility, automated WhatsApp replacement,
          instant advance UPI collections, and fast 2-minute setup.
        </p>
      </div>

      {/* FAQ Accordion Grid */}
      <div className="max-w-3xl mx-auto" >
        <Accordion items={faqItems} />
      </div>

      {/* Still Have Questions Quick Support Card */}
      <div className="max-w-3xl mx-auto mt-10 bg-linear-to-r from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-stone-800">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold shrink-0 shadow-md">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-extrabold text-base sm:text-lg text-white">Still Have Questions or Need Setup Help?</h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mt-0.5">
              Talk directly with our technical support team on WhatsApp & AnyDesk.
            </p>
          </div>
        </div>

        <Link
          to="/contact"
          className="bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md flex items-center gap-2 shrink-0 active:scale-98 transition-all cursor-pointer"
        >
          <span>Chat with Support</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
