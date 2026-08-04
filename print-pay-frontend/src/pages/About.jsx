import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Store,
  Printer,
  ShieldCheck,
  Building2,
  GraduationCap,
  BookOpen,
  Layers,
  TrendingUp,
  MessageSquareCheck,
  Target,
  Compass,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

// 5-step origin story narrative
const originNarrative = [
  {
    step: '1',
    title: 'Ek Chhoti Cyber Cafe Ki Shuruat',
    desc: 'Humne ek chhotey se sheher mein Cyber Cafe aur Xerox center shuru kiya tha. Log daily form bharne aur document print out lene aate the.',
  },
  {
    step: '2',
    title: 'Daily Frustration & Crowd Management',
    desc: 'Counter par 30-40 log ek sath खड़े hoke bolte - "Bhaiya WhatsApp check karo, admit card bhej diya". Har baar PC mein WhatsApp open karo, download karo, aur manual print command do.',
  },
  {
    step: '3',
    title: 'Apni Shop Ke Liye Software Banaya',
    desc: 'Is pareshaan se bachne ke liye humne ek smart QR system coder ki tarah develop kiya jisse customer QR scan kare, pay kare aur automatic computer se print nikal aaye.',
  },
  {
    step: '4',
    title: 'Real Customer Feedback & Refinement',
    desc: 'Aas-paas ke 10 cyber cafe valon ne jab dekha toh unhone bhi manga. Unke feedback par humne Black & White vs Color printer mapping aur Instant QR branding features add kiye.',
  },
  {
    step: '5',
    title: 'Poore Bharat Ke Shop Owners Ke Liye Open',
    desc: 'Aaj QR Se Print poore India ke CSC centers, xerox centers aur digital service providers ka sabse trusted smart print network ban chuka hai!',
  },
]

// "Who it's for" audience list
const audienceList = [
  { icon: Store, title: 'Cyber Cafes', desc: 'Lambi line khatam, automatic printing start.' },
  { icon: Printer, title: 'Print & Xerox Shops', desc: 'Customer phone se photo/PDF direct print.' },
  { icon: ShieldCheck, title: 'CSC Centers', desc: 'Sarkari digital kaam fast aur hassle-free.' },
  { icon: Building2, title: 'Digital Service Centres', desc: 'Bina WhatsApp share kiye direct print.' },
  { icon: GraduationCap, title: 'Schools & Colleges', desc: 'Student notes & admit card quick print.' },
  { icon: BookOpen, title: 'Coaching Institutes', desc: 'Assignment & test paper instant printout.' },
  { icon: Layers, title: 'Libraries & Offices', desc: 'Daily self-service document printing.' },
  { icon: TrendingUp, title: 'Small & Medium Businesses', desc: 'Digital payment + auto-print all in one.' },
]

export default function About() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 py-10 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <span className="text-[#F0245C] font-bold text-xs uppercase tracking-wider bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full w-max mx-auto">
          Hamari Kahani
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-tight">
          Shop Owner Ne Hi Banaya, Shop Owners Ke Liye
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          QR Se Print kisi corporate boardroom mein nahi, balki ek asli cyber café ke counter par paida hua platform hai.
        </p>
      </div>

      {/* 5-Step Origin Narrative */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm">
        <div className="max-w-2xl mb-10">
          <span className="text-[#F0245C] font-bold text-xs uppercase">5-Step Origin Story</span>
          <h2 className="text-3xl font-extrabold text-stone-900 mt-1">Kaise Shuru Hua QR Se Print?</h2>
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
          <h3 className="text-2xl font-extrabold text-stone-900">Hamara Mission</h3>
          <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
            Bharat ke har chhote cyber café aur xerox center ko simple, affordable aur fast automation dena jisse unka samay bache aur daily income 2x badh sake.
          </p>
        </div>

        {/* Support Model */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <MessageSquareCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900">100% Direct Support Model</h3>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
            Hum koi fake third-party ticketing portal use nahi karte. Har shop owner ko direct WhatsApp Support aur AnyDesk assistant dwara instant solution diya jata hai.
          </p>
        </div>

      </div>

      {/* Audience List */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900">Kis-Kis Ke Liye Hai Platform?</h2>
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
          Hum chahte hain ki Bharat ka har cyber cafe bina kisi manual jhanjhat ke smooth digital services aur self-service printing offer kar sake.
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
