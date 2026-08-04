import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Contact form submitted:', formData)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div className="flex flex-col gap-16 md:gap-20 py-10 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-[#F0245C] font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Contact Us
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Get in Touch with Us
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Have questions, need setup assistance, or want to discuss a business inquiry? Contact our team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Contact Direct Info */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-2xl text-stone-900">Direct Contact Information</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Our support team is ready to assist you. Click below to chat directly with us on WhatsApp.
            </p>

            <div className="space-y-4 pt-2">
              <a
                href="mailto:qrseprint@gmail.com"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-[#F0245C] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#F0245C] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-stone-400">Email Us</span>
                  <p className="font-bold text-stone-900 text-base">qrseprint@gmail.com</p>
                </div>
              </a>

              <a
                href="tel:8404832414"
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-500 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-stone-400">Call Support</span>
                  <p className="font-bold text-stone-900 text-base">84048 32414</p>
                </div>
              </a>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/918404832414?text=Hello%20QR%20Se%20Print%20Team%2C%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-full shadow-md flex items-center justify-center gap-2.5 cursor-pointer text-sm"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  <span>Chat Directly on WhatsApp</span>
                </motion.button>
              </a>
            </div>
          </div>

          {/* Business Inquiry Note */}
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex items-start gap-4">
            <Briefcase className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-extrabold text-amber-900 text-base">Business & Partnership Inquiries</h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                Interested in becoming a regional distributor or partner? Message us on WhatsApp with "Business Inquiry".
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-lg relative">
            <h3 className="font-extrabold text-2xl text-stone-900 mb-2">Send Us a Message</h3>
            <p className="text-stone-500 text-sm mb-6">Fill out the form below and our team will respond within 24 hours.</p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center gap-4 my-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-emerald-900 text-2xl">Message Received!</h4>
                <p className="text-emerald-800 text-sm max-w-md">
                  Thank you! Your message has reached us. We will get back to you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({ name: '', email: '', message: '' })
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 outline-none text-sm font-medium transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 px-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 outline-none text-sm font-medium transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Message / Query *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your query or message in detail..."
                    className="p-4 rounded-xl border border-stone-300 focus:border-[#F0245C] focus:ring-2 focus:ring-[#F0245C]/20 outline-none text-sm font-medium transition-all resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-[#F0245C] hover:bg-[#D81B4E] text-white font-extrabold py-4 rounded-full shadow-lg shadow-[#F0245C]/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Submit Message'}</span>
                </motion.button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
