import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Search, CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminShops() {
  const [searchTerm, setSearchTerm] = useState('')
  const { shopsLoading, shopsData, fetchShops } = useAdminStore()

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  const filteredShops = shopsData.filter((s) => {
    const name = (s.shopName || s.name || '').toLowerCase()
    const code = (s.shopCode || s.code || '').toLowerCase()
    const city = (s.cityState || s.city || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    return name.includes(term) || code.includes(term) || city.includes(term)
  })


  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Registered Shops Management
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Manage 128 registered print shops, subscriptions, and active agent statuses across India
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-stone-950 rounded-3xl p-5 border border-stone-800 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Shop Name, Code, City..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-800 bg-stone-900 focus:border-brand text-xs text-white font-medium outline-none"
          />
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Shop ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Agent Status</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {shopsLoading ? (
                <tr>
                  <td colSpan="8" className="py-8">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500 font-medium">
                    No shops found. Shops will appear here after registration.
                  </td>
                </tr>
              ) : (
                filteredShops.map((s) => (
                  <tr key={s.shopCode || s.code || s._id} className="hover:bg-stone-900/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-white font-mono text-xs">{s.shopCode || s.code || '—'}</td>
                    <td className="py-4 px-4 font-semibold text-stone-200">{s.shopName || s.name || '—'}</td>
                    <td className="py-4 px-4 text-xs font-medium text-stone-300">{s.ownerName || s.owner || '—'}</td>
                    <td className="py-4 px-4 text-xs font-mono text-stone-400">{s.mobile || s.phone || '—'}</td>
                    <td className="py-4 px-4 text-xs font-medium text-stone-400">{s.cityState || s.city || '—'}</td>
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-900/60">
                        {s.plan === 'MONTHLY_399' ? '₹399 / Mo' : s.plan === 'LIFETIME_599' ? '₹599 Lifetime' : s.plan || 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {(s.agentConnected || s.isOnline) ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-rose-950 text-rose-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-900">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Offline
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button className="btn btn-ghost btn-sm !text-brand hover:!bg-rose-950/40 w-max">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
