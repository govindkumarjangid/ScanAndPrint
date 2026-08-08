import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Printer,
  CreditCard,
  Phone,
  faqItems,
} from '../../assets/assets'
import { Link } from 'react-router'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Hardware & Setup', 'Workflow & WhatsApp', 'Payment & Pricing', 'Privacy & Security']

  const filteredFaqs =
    selectedCategory === 'All'
      ? faqItems
      : faqItems.filter((item) => item.category === selectedCategory || item.category?.includes(selectedCategory.split(' ')[0]))

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQ Accordion Grid */}
      <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                  ? 'bg-white border-amber-300 shadow-[0_6px_20px_rgba(0,0,0,0.05)] ring-2 ring-amber-400/20'
                  : 'bg-white/90 border-stone-200/80 hover:border-stone-300 shadow-2xs'
                }`}
            >
              {/* Question Header Button */}
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-brand text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                  >
                    <span className="text-xs font-black">{idx + 1}</span>
                  </div>

                  <span
                    className={`font-bold text-sm sm:text-base leading-snug transition-colors ${isOpen ? 'text-stone-950' : 'text-stone-800'
                      }`}
                  >
                    {faq.question}
                  </span>
                </div>

                {/* Animated Chevron Icon */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-amber-100 text-stone-900' : 'bg-stone-100 text-stone-500'
                    }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Collapsible Answer Body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-stone-100 text-stone-600 text-xs sm:text-sm leading-relaxed">
                      <p>{faq.answer}</p>

                      {faq.category && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                            Category:
                          </span>
                          <span className="text-[11px] font-bold text-brand bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                            {faq.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
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
