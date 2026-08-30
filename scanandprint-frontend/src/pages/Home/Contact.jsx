import { useState } from 'react'
import { motion } from 'framer-motion'
import SEO from '../../components/common/SEO'
import {
  Send,
  CheckCircle2,
  Briefcase,
  MapPin,
} from '../../assets/assets'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function Contact() {
  const { publicSettings } = useAuthStore()
  const monthlyPrice = publicSettings?.monthlyPrice || 299
  const yearlyPrice = publicSettings?.yearlyPrice || 799

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/contact', formData)
      if (res.data.success) {
        setSubmitted(true)
        toast.success('Your message has been sent to our support desk!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deliver message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16 py-10 px-4 sm:px-6 max-w-300 mx-auto w-full">
      <SEO path="/contact" />
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-brand font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto flex items-center gap-1.5 shadow-2xs">
          <span>24/7 Dedicated Support</span>
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Get in Touch with <span className="marker-highlight text-stone-900">Scan&Print</span>
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Have questions about hardware compatibility, need 1-on-1 setup assistance, or want to explore partnership
          opportunities? Our team is always ready to assist you.
        </p>
      </div>

      {/* main div */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* left section  */}
        <div className="lg:col-span-6 order-1">
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-stone-200/90 shadow-md relative">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Direct Contact Form</span>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-stone-900 mt-1">Send Us a Message</h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Fill out the details below and our technical support team will respond within 2 hours.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center gap-4 my-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-extrabold text-emerald-950 text-2xl">Message Received!</h3>
                <p className="text-emerald-800 text-xs sm:text-sm max-w-sm leading-relaxed">
                  Thank you! Your query has been delivered to our support team. We will get in touch with you shortly on
                  WhatsApp and Email.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
                  }}
                  className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Your Full Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Govind Kumar"
                    className="h-11 sm:h-12 px-4 rounded-xl border border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-xs sm:text-sm font-medium transition-all"
                  />
                </div>

                {/* Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Email Address <span className="text-brand">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="h-11 sm:h-12 px-4 rounded-xl border border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Phone / WhatsApp <span className="text-brand">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="h-11 sm:h-12 px-4 rounded-xl border border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Inquiry Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Inquiry Type</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-11 sm:h-12 px-4 rounded-xl border border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-xs sm:text-sm font-medium transition-all bg-white"
                  >
                    <option value="General Inquiry">General Inquiry / Demo</option>
                    <option value="Shop Setup Assistance">Printer Setup Assistance</option>
                    <option value="Billing & Pricing">Billing &amp; Pricing Plan (₹{monthlyPrice} / ₹{yearlyPrice})</option>
                    <option value="Business Partnership">Business &amp; Regional Franchise</option>
                  </select>
                </div>

                {/* Message Query */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Message / Query <span className="text-brand">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question, printer model (e.g. Epson L3210, HP LaserJet), or requirement..."
                    className="p-4 rounded-xl border border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-xs sm:text-sm font-medium transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary py-3.5 mt-1 w-max px-8 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* right section */}
        <div className="lg:col-span-6 order-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-stone-100/80">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-2xs">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight">Head Office &amp; Support Hub</h3>
                  <p className="text-stone-500 text-xs sm:text-[13px] leading-relaxed mt-0.5">
                    {publicSettings?.supportAddress || 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Open 9 AM – 9 PM
                </span>
              </div>
            </div>

            {/* Google Map Iframe Embed */}
            <div className="w-full h-56 sm:h-105 rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative group">
              <iframe
                title="Scan and Print Head Office Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(publicSettings?.supportAddress || 'Jaipur Rajasthan India')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-20 contrast-105 group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>

          {/* Business & Partnership Inquiries*/}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <Briefcase className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">Business & Regional Franchise</h4>
              <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                Interested in onboarding multiple cyber cafes or becoming a regional partner? Contact our business team
                with subject "Franchise Partnership".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
