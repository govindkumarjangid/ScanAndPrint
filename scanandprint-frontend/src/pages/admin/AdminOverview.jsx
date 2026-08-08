import React from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  Store,
  Printer,
  Monitor,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'

const recentOnboardedShops = [
  {
    code: 'SHOP_98234',
    name: 'Sharma Cyber Cafe',
    owner: 'Rahul Kumar',
    city: 'New Delhi, Delhi',
    plan: 'MONTHLY_399',
    status: 'Active',
    joined: '2 hours ago',
  },
  {
    code: 'SHOP_98233',
    name: 'Gupta Xerox & CSC Center',
    owner: 'Amit Gupta',
    city: 'Patna, Bihar',
    plan: 'LIFETIME_599',
    status: 'Active',
    joined: '5 hours ago',
  },
  {
    code: 'SHOP_98232',
    name: 'Prakash Digital Prints',
    owner: 'Prakash Verma',
    city: 'Ranchi, Jharkhand',
    plan: 'MONTHLY_399',
    status: 'Active',
    joined: '1 day ago',
  },
  {
    code: 'SHOP_98231',
    name: 'Apex Coaching Print Station',
    owner: 'Sanjay Mehta',
    city: 'Kota, Rajasthan',
    plan: 'LIFETIME_599',
    status: 'Active',
    joined: '2 days ago',
  },
]

export default function AdminOverview() {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Platform GMV */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Platform GMV
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-950/80 text-brand border border-rose-900/60">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">₹2,48,500</h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +38% growth this month
            </span>
          </div>
        </motion.div>

        {/* Active Shops */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Active Print Shops
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-900/60">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">128</h3>
            <span className="text-xs font-medium text-stone-400 mt-1 block">
              Across 18 States in India
            </span>
          </div>
        </motion.div>

        {/* Total Documents Printed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Documents Printed
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-900/60">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">14,290</h3>
            <span className="text-xs font-medium text-stone-400 mt-1 block">
              100% Zero-fail Auto Print
            </span>
          </div>
        </motion.div>

        {/* Desktop Print Agents Online */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Desktop Agents Live
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-900/60">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-2xl font-extrabold text-white">114 / 128</h3>
            </div>
            <span className="text-xs font-medium text-emerald-400 mt-1 block">
              89% Live Connection Rate
            </span>
          </div>
        </motion.div>

      </div>

      {/* Recent Onboarded Shops Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-white font-heading">Recently Onboarded Shops</h3>
            <p className="text-xs text-stone-400 mt-0.5">Shops registered on QR PrintPe platform</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Shop ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Plan Type</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {recentOnboardedShops.map((s) => (
                <tr key={s.code} className="hover:bg-stone-900/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-white font-mono text-xs">{s.code}</td>
                  <td className="py-4 px-4 font-semibold text-stone-200">{s.name}</td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-300">{s.owner}</td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-400">{s.city}</td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-900/60">
                      {s.plan === 'MONTHLY_399' ? '₹399 / Mo' : '₹599 Lifetime'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
