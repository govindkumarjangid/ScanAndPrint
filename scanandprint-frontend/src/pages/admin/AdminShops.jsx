import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Search, CheckCircle2, XCircle, ShieldCheck, Loader2, ChevronLeft, ChevronRight, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import AdminDemoTimer from '../../components/ui/AdminDemoTimer'

export default function AdminShops() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { shopsLoading, shopsData, shopsPagination, fetchShops } = useAdminStore()

  useEffect(() => {
    fetchShops(currentPage, 10, searchTerm)
  }, [fetchShops, currentPage])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    fetchShops(1, 10, searchTerm)
  }

  const pagination = shopsPagination || {
    totalCount: shopsData.length,
    currentPage,
    totalPages: Math.ceil(shopsData.length / 10) || 1,
    limit: 10,
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Registered Shops Management
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 font-medium">
            Manage registered print shops, subscriptions, and active agent statuses across India
          </p>
        </div>

        <button
          onClick={() => fetchShops(currentPage, 10, searchTerm)}
          disabled={shopsLoading}
          className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${shopsLoading ? 'animate-spin text-rose-500' : ''}`} />
          <span>Refresh Shops</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Shop Name, Code, Phone..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-3 py-2"
          >
            Search
          </button>
        </form>
      </div>

      {/* Shops Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4">Shop ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Plan Type</th>
                <th className="py-3.5 px-4">Subscription</th>
                <th className="py-3.5 px-4 text-right">Agent Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {shopsLoading ? (
                <tr>
                  <td colSpan="8" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                      <span className="font-semibold text-xs text-stone-400">Loading shops...</span>
                    </div>
                  </td>
                </tr>
              ) : shopsData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500 text-sm font-medium">
                    No shops found matching your search.
                  </td>
                </tr>
              ) : (
                shopsData.map((s) => {
                  const pType = s.planType || s.plan || (s.isDemoAccount ? 'FREE_TRIAL' : 'MONTHLY_299')
                  const subStatus = s.status || (s.isDemoAccount ? 'Demo Active' : 'Active')
                  const isOnline = Boolean(s.isOnline)

                  return (
                    <tr key={s.shopCode || s.code || s._id} className="hover:bg-stone-900/60 transition-colors whitespace-nowrap">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs select-all">{s.shopCode || s.code || '—'}</td>
                      <td className="py-4 px-4 font-semibold text-stone-200">{s.shopName || s.name || '—'}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-300">{s.ownerName || s.owner || '—'}</td>
                      <td className="py-4 px-4 text-xs font-mono text-stone-400">{s.phone || s.mobile || '—'}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-400">{s.address || s.cityState || s.city || '—'}</td>
                      <td className="py-4 px-4">
                        {pType === 'FREE_TRIAL' || s.isDemoAccount ? (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-xs whitespace-nowrap">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Free Demo (2-Hr)</span>
                            </span>
                            <AdminDemoTimer demoExpiresAt={s.demoExpiresAt} createdAt={s.createdAt} status={subStatus} />
                          </div>
                        ) : pType === 'YEARLY_799' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-800/80 whitespace-nowrap">
                            ₹799 / Yr (Yearly)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-900/60 whitespace-nowrap">
                            ₹299 / Mo (Monthly)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {s.isDemoAccount || pType === 'FREE_TRIAL' ? (
                          subStatus === 'Demo Active' || subStatus === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-950/90 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-800/80 shadow-xs whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Demo Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-900 whitespace-nowrap">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Demo Expired</span>
                            </span>
                          )
                        ) : subStatus === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900 whitespace-nowrap shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : subStatus === 'Expired' ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-900 whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-950/90 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-900 whitespace-nowrap">
                            <span>{subStatus}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-stone-900 text-stone-400 text-[11px] font-extrabold px-3 py-1 rounded-full border border-stone-800 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-stone-500" /> Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-stone-800">
            <span className="text-xs font-medium text-stone-400">
              Showing page <strong className="text-white">{pagination.currentPage}</strong> of <strong className="text-white">{pagination.totalPages}</strong> ({pagination.totalCount} shops)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1 || shopsLoading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-stone-300 px-2">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage >= pagination.totalPages || shopsLoading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
