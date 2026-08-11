import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Target,
  MessageSquareCheck,
  Compass,
  ArrowRight,
  audienceList,
} from '../../assets/assets'
import { Zap, ShieldCheck, Printer } from 'lucide-react'

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

      {/* Platform Overview */}
      <div className="relative bg-stone-900 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl border border-stone-800">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 max-w-2xl mb-12">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">The Platform</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Revolutionizing Cyber Café Printing</h2>
          <p className="text-stone-400 mt-4 text-sm sm:text-base leading-relaxed">
            Scan&Print is a cutting-edge SaaS platform designed exclusively for print shops. We bridge the gap between your existing offline hardware and seamless online automation, eliminating counter queues and manual file transfers.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-stone-800/50 backdrop-blur-md p-6 rounded-2xl border border-stone-700 flex flex-col gap-4 hover:bg-stone-800/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center font-bold shadow-lg">
              <Zap className="w-6 h-6 fill-stone-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white mb-2">Instant Sync Queue</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Files uploaded by customers via QR code instantly sync to your desktop client for automated queueing and printing.
              </p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-stone-800/50 backdrop-blur-md p-6 rounded-2xl border border-stone-700 flex flex-col gap-4 hover:bg-stone-800/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F0245C] text-white flex items-center justify-center font-bold shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white mb-2">100% Data Privacy</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Customer documents are encrypted and automatically deleted from our servers immediately after they are successfully printed.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-stone-800/50 backdrop-blur-md p-6 rounded-2xl border border-stone-700 flex flex-col gap-4 hover:bg-stone-800/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white mb-2">Zero New Hardware</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Works flawlessly with your existing Windows PC setup. Connects with any standard USB or Network printer you already own.
              </p>
            </div>
          </div>
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
          <button
            className="btn btn-primary btn-lg"
          >
            <span>Register Shop Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}
