import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Target,
  MessageSquareCheck,
  Compass,
  ArrowRight,
  originNarrative,
  audienceList,
} from '../../assets/assets'

export default function About() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 py-10 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-[#F0245C] font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Our Journey
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Built by Shop Owners, for Shop Owners
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Scan&Print was born on an active cyber café counter, not in a distant corporate boardroom.
        </p>
      </div>

      {/* 5-Step Origin Narrative */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm">
        <div className="max-w-2xl mb-10">
          <span className="text-[#F0245C] font-bold text-xs uppercase">5-Step Origin Story</span>
          <h2 className="text-3xl font-extrabold text-stone-900 mt-1">How Scan&Print Started</h2>
        </div>

        <div className="space-y-8">
          {originNarrative.map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 sm:gap-6 border-b border-stone-100 pb-8 last:border-0 last:pb-0"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-stone-900 font-extrabold text-lg sm:text-xl flex items-center justify-center flex-shrink-0 shadow-xs">
                {item.step}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-xl text-stone-900">{item.title}</h3>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mission & Support Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl p-8 border border-rose-200/60 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0245C] text-white flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900">Our Mission</h3>
          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
            To provide every small cyber café and xerox center in India with simple, affordable, and fast automation that saves time and doubles daily revenue.
          </p>
        </div>

        {/* Support Model */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <MessageSquareCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900">100% Direct Support Model</h3>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
            We skip confusing third-party ticket systems. Every shop owner gets direct 1-on-1 WhatsApp and AnyDesk remote desktop support.
          </p>
        </div>

      </div>

      {/* Audience List */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900">Who is the Platform For?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audienceList.map((aud, idx) => {
            const Icon = aud.icon
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-stone-900">{aud.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{aud.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vision Statement */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-4">
        <Compass className="w-12 h-12 text-amber-400 mb-2" />
        <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Vision Statement</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl">
          India's Most Trusted Smart Printing Platform
        </h2>
        <p className="text-stone-400 text-base max-w-xl">
          Empowering every print shop in India to offer seamless, self-service digital document printing without manual intervention.
        </p>
        <Link to="/register" className="mt-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="bg-[#F0245C] hover:bg-[#D81B4E] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-md flex items-center gap-2"
          >
            <span>Register Shop Today</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
