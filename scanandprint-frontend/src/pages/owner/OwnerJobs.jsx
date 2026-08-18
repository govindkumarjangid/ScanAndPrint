import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  CheckCircle2,
  RefreshCw,
  Printer,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { useJobStore } from '../../store/useJobStore'

export default function OwnerJobs() {
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const { jobs, pagination, fetchJobs, refreshJobs, isLoading, isRefreshing } = useJobStore()

  useEffect(() => {
    fetchJobs(currentPage, 10, statusFilter)
  }, [fetchJobs, currentPage, statusFilter])

  const handleStatusChange = (st) => {
    setStatusFilter(st)
    setCurrentPage(1)
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setAppliedSearch(searchInput.trim())
    setCurrentPage(1)
  }

  const filteredJobs = jobs.filter((j) => {
    if (!appliedSearch) return true
    const q = appliedSearch.toLowerCase()
    const fileName = (j.originalFileName || j.file || '').toLowerCase()
    const jobId = (j.jobId || j.id || '').toLowerCase()
    const phone = (j.customerPhone || '').toLowerCase()

    return fileName.includes(q) || jobId.includes(q) || phone.includes(q)
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Print Orders Queue & History
          </h1>
          <p className="text-stone-500 text-sm mt-0.5 font-medium">
            Monitor real-time incoming auto-print documents and order statuses
          </p>
        </div>

        <button
          onClick={() => refreshJobs(currentPage, 10, statusFilter)}
          disabled={isLoading || isRefreshing}
          className="btn btn-secondary bg-stone-200! hover:bg-stone-300! text-stone-800! btn-sm flex items-center gap-2"
        >
          {isRefreshing || isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input & Button */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value
                setSearchInput(val)
                if (val === '' && appliedSearch !== '') {
                  setAppliedSearch('')
                  setCurrentPage(1)
                }
              }}
              placeholder="Search Job ID, filename, phone..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary h-10 px-4 text-xs font-extrabold flex items-center gap-1.5 shrink-0 rounded-xl shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Status Select Menu Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative w-full sm:w-48">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-stone-300 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-brand text-xs font-bold text-stone-700 outline-none appearance-none cursor-pointer transition-all shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Printed">🟢 Printed</option>
              <option value="Dispatch">🔵 Dispatch</option>
              <option value="Pending">🟡 Pending</option>
              <option value="Failed">🔴 Failed</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="w-full overflow-hidden">
          <table className="w-full text-left text-sm border-collapse block md:table md:table-fixed">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-stone-200/80 text-stone-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-3 md:w-[16%]">Job ID</th>
                <th className="py-3.5 px-3 md:w-[25%]">Document File</th>
                <th className="py-3.5 px-3 md:w-[10%]">Customer</th>
                <th className="py-3.5 px-3 md:w-[12%]">Pages / Copies</th>
                <th className="py-3.5 px-3 md:w-[7%]">Type</th>
                <th className="py-3.5 px-3 md:w-[7%]">Amount</th>
                <th className="py-3.5 px-3 md:w-[11%]">Time</th>
                <th className="py-3.5 px-3 md:w-[12%] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-stone-100">
              {isLoading && jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-brand" />
                      <span>Loading orders from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500 font-medium">
                    No print jobs match your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr
                    key={j._id || j.id || j.jobId}
                    className="block md:table-row bg-stone-50/40 md:bg-transparent border border-stone-200/80 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0 hover:bg-stone-50/60 transition-colors"
                  >
                    {/* Job ID */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 font-bold text-stone-900 font-mono text-xs overflow-hidden">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Job ID</span>
                      <span className="truncate block font-mono text-stone-900" title={j.jobId || j.id}>{j.jobId || j.id}</span>
                    </td>

                    {/* Document File */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 font-semibold text-stone-800 overflow-hidden">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0 mr-2">File</span>
                      <span
                        className="truncate block max-w-[160px] sm:max-w-[280px] md:max-w-full text-right md:text-left text-xs sm:text-sm font-medium text-stone-800"
                        title={j.originalFileName || j.file || 'Document.pdf'}
                      >
                        {j.originalFileName || j.file || 'Document.pdf'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 text-xs font-mono text-stone-600 overflow-hidden whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Customer</span>
                      <span className="truncate block">{j.customerPhone || 'Counter'}</span>
                    </td>

                    {/* Pages / Copies */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 text-xs font-medium text-stone-600 overflow-hidden whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Details</span>
                      <span className="truncate block">
                        {j.totalPages || j.pages || 1} p × {j.copies || 1} c
                      </span>
                    </td>

                    {/* Type */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Type</span>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                          (j.colorType === 'COLOR' || j.type === 'Color')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {(j.colorType === 'COLOR' || j.type === 'Color') ? 'Color' : 'B&W'}
                      </span>
                    </td>

                    {/* Amount  */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-4 whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Amount</span>
                      ₹{j.totalAmount || j.amount || 10}
                    </td>

                    {/* Time */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 text-xs font-medium text-stone-500 whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Time</span>
                      {j.createdAt ? new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (j.time || 'Just now')}
                    </td>

                    {/* Status */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 pb-1 md:pb-4 whitespace-nowrap text-right">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Status</span>
                      <div className="flex items-center md:justify-end">
                        {(() => {
                          const s = String(j.status || '').toUpperCase()
                          if (s.includes('PRINTED') || s === 'COMPLETED' || s === 'SUCCESS') {
                            return (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Printed</span>
                              </span>
                            )
                          }
                          if (s.includes('DISPATCH') || s === 'PRINTING' || s === 'IN_QUEUE') {
                            return (
                              <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
                                <span>Dispatch</span>
                              </span>
                            )
                          }
                          if (s.includes('FAIL') || s.includes('CANCEL') || s.includes('REJECT') || s.includes('ERROR')) {
                            return (
                              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                                <span>Failed</span>
                              </span>
                            )
                          }
                          return (
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Pending</span>
                            </span>
                          )
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalCount > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{((currentPage - 1) * 10) + 1}</span> to{' '}
              <span className="font-bold text-stone-800">
                {Math.min(currentPage * 10, pagination.totalCount)}
              </span>{' '}
              of <span className="font-bold text-stone-800">{pagination.totalCount}</span> orders
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="btn btn-sm btn-ghost border border-stone-200/80 px-2.5 py-1 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  return (
                    <React.Fragment key={p}>
                      {prev && p - prev > 1 && (
                        <span className="px-1 text-xs text-stone-400 font-mono">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all ${
                          currentPage === p
                            ? 'bg-brand text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  )
                })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
                disabled={currentPage >= (pagination.totalPages || 1) || isLoading}
                className="btn btn-sm btn-ghost border border-stone-200/80 px-2.5 py-1 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
