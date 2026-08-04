import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  QrCode,
  Printer,
  Zap,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  BookOpen,
  Store,
  Layers,
  FileCheck,
  Check,
  UserCheck,
  TrendingUp,
} from 'lucide-react'

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

// Feature highlight snippets
const highlights = [
  {
    icon: QrCode,
    title: 'Scan → Upload → Pay → Auto Print',
    desc: 'Customer counter ka QR scan karega, file upload karega, payment karega — PC par print automatic nikal jayega!',
  },
  {
    icon: Printer,
    title: 'Koi WiFi Printer Nahi Chahiye',
    desc: 'Aapke normal USB / Desktop printer par hi software install hoga aur 100% kaam karega.',
  },
  {
    icon: ShieldCheck,
    title: 'Auto-Deleted Private Files',
    desc: 'Print hote hi customer ki file automatically delete ho jaati hai. Privacy aur trust 100%.',
  },
]

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 md:pt-16 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-300/80 px-4 py-1.5 rounded-full text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>India ka #1 Smart Printing Network for Shops</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
              Customer QR Scan Karega,{' '}
              <span className="marker-highlight text-stone-900">Print Khud Nikal</span> Jaye!
            </h1>

            {/* Subheadline in Hinglish */}
            <p className="text-stone-600 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
              Ab customer se WhatsApp par file maangna, PC mein download karna aur manually print dena band karo.
              <span className="font-bold text-stone-900"> QR Se Print</span> karega sab automatic!
            </p>

            {/* Steps Pills */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-stone-700">
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-black">1</span> Scan
              </span>
              <span className="text-stone-300 self-center">›</span>
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-black">2</span> Upload
              </span>
              <span className="text-stone-300 self-center">›</span>
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-black">3</span> Pay
              </span>
              <span className="text-stone-300 self-center">›</span>
              <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Auto Print!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto bg-[#F0245C] hover:bg-[#D81B4E] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-[#F0245C]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register Shop</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link to="/features" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 px-7 py-4 rounded-full font-bold text-base shadow-xs flex items-center justify-center cursor-pointer"
                >
                  See Features
                </motion.button>
              </Link>
            </div>

            {/* Quick Trust badges */}
            <div className="flex items-center gap-6 text-xs text-stone-500 font-semibold pt-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 2 Min Setup
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Unlimited Prints
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Normal Printer Supported
              </span>
            </div>
          </motion.div>

          {/* Hero Right Visual Graphic Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200/80">
              
              {/* Badge Overlay */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-stone-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md rotate-3 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-stone-900" /> Auto-Print Live
              </div>

              <div className="bg-[#FFFBF7] rounded-2xl p-5 border border-stone-200/70 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F0245C] text-white flex items-center justify-center shadow-lg shadow-[#F0245C]/30 animate-pulse">
                  <QrCode className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg">Sharma Cyber Cafe</h3>
                  <p className="text-xs text-stone-500">Scan QR Code at Counter</p>
                </div>

                <div className="w-full bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col gap-2 text-left text-xs">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>Aadhaar_Card.pdf</span>
                    <span className="text-[#F0245C]">2 Pages (Color)</span>
                  </div>
                  <div className="w-full bg-emerald-100 text-emerald-800 p-2 rounded-lg font-semibold flex items-center justify-between text-xs">
                    <span>Payment Received: ₹20</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full w-full justify-center">
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>Printing on Epson L3210...</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ORIGIN STORY TEASER SECTION */}
      <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl p-8 sm:p-12 border border-amber-200/70 shadow-sm relative overflow-hidden"
        >
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider bg-amber-200/60 px-3 py-1 rounded-md w-max">
              Real Shop Owner Story
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              "Bhaiya WhatsApp pe file bhej di hai, print nikal do!" — Is problem se pareshaan ho gaye the.
            </h2>
            <p className="text-stone-700 leading-relaxed text-base sm:text-lg">
              Daily cyber café chalaate waqt counter par 50 log WhatsApp par photo aur PDF bhejte the. Subah se shaam tak PC mein WhatsApp Web scan karo, files download karo, print karo, aur ₹5 lene ke liye QR dikhao.
              Isi daily frustration se janam hua <span className="font-bold text-[#F0245C]">QR Se Print</span> ka — humne pehle apni shop ke liye banaya, aur jab kaam 10x fast ho gaya, tab saare shop owners ke liye release kar diya!
            </p>

            <div className="pt-2">
              <Link to="/about" className="inline-flex items-center gap-2 text-[#F0245C] font-bold text-sm hover:underline">
                <span>Puri Kahani Padho (Origin Story)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* WHO IT'S FOR ICON GRID */}
      <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
          <span className="text-[#F0245C] font-bold text-xs tracking-wider uppercase">Target Audience</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            QR Se Print Kis-Kis Ke Liye Hai?
          </h2>
          <p className="text-stone-600 text-base">
            Agar aapke paas customer printout lene aate hain, toh ye aapka 80% time aur mehnat bachayega.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {audienceList.map((aud, idx) => {
            const Icon = aud.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#F0245C] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-stone-900">{aud.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{aud.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* FEATURE HIGHLIGHTS SNIPPET */}
      <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <div>
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Features Snippet</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Kyun Best Hai QR Se Print?
              </h2>
            </div>
            <Link to="/features">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#F0245C] hover:bg-[#D81B4E] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md flex items-center gap-2"
              >
                <span>Saare Features Dekho</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h, i) => {
              const IconComponent = h.icon
              return (
                <div key={i} className="bg-stone-800/80 p-6 rounded-2xl border border-stone-700/60 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{h.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{h.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER BEFORE FOOTER */}
      <section className="px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
        <div className="bg-gradient-to-r from-[#F0245C] to-[#ff4d7e] rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl leading-tight">
            Aaj Hi Apni Shop Ko Smart & Automated Banao!
          </h2>
          <p className="text-rose-100 text-base sm:text-lg max-w-xl">
            Bas 2 minute lagte hain register karne mein. Koi hardware change nahi, normal printer par start karo!
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="bg-amber-400 hover:bg-amber-300 text-stone-900 px-9 py-4 rounded-full font-extrabold text-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Register Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  )
}
