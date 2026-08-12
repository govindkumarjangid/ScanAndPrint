import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, CheckCircle2, RefreshCw, Printer, Clock, Loader2 } from 'lucide-react'
import { useJobStore } from '../../store/useJobStore'

export default function OwnerJobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { jobs, fetchJobs, refreshJobs, isLoading, isRefreshing } = useJobStore()

  useEffect(() => {
    fetchJobs(1, 50)
  }, [fetchJobs])

  const filteredJobs = jobs.filter((j) => {
    const fileName = j.originalFileName || j.file || ''
    const jobId = j.jobId || j.id || ''
    const phone = j.customerPhone || ''
    const matchesSearch =
      fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Printed' && (j.status === 'PRINTED_SUCCESSFULLY' || j.status === 'Printed')) ||
      (statusFilter === 'Pending' && (j.status === 'PENDING_PAYMENT' || j.status === 'PAYMENT_VERIFIED' || j.status === 'DISPATCHED_TO_AGENT' || j.status === 'Pending'))

    return matchesSearch && matchesStatus
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
          onClick={() => refreshJobs(statusFilter)}
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
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Job ID, filename, phone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
          {['ALL', 'Printed', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st
                ? 'btn-primary shadow-2xs'
                : 'btn-ghost text-stone-600'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="w-full overflow-hidden md:overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-stone-200/80 text-stone-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Job ID</th>
                <th className="py-3.5 px-4">Document File</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Pages / Copies</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-stone-100">
              {isLoading && jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500">
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
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-bold text-stone-900 font-mono text-xs">
                      <span className="md:hidden text-stone-500 font-sans font-medium">Job ID</span>
                      {j.jobId || j.id}
                    </td>

                    {/* Document File */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-semibold text-stone-800">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium">File</span>
                      <span className="truncate max-w-40 text-right md:text-left md:max-w-none">
                        {j.originalFileName || j.file || 'Document.pdf'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-mono text-stone-600">
                      <span className="md:hidden text-stone-500 font-sans font-medium">Customer</span>
                      {j.customerPhone || 'Counter'}
                    </td>

                    {/* Pages / Copies */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-medium text-stone-600">
                      <span className="md:hidden text-stone-500 font-sans font-medium">Details</span>
                      <span>
                        {j.totalPages || j.pages || 1} pages × {j.copies || 1} copy
                      </span>
                    </td>

                    {/* Type */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Type</span>
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
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-4">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Amount</span>
                      ₹{j.totalAmount || j.amount || 10}
                    </td>

                    {/* Time */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-medium text-stone-500">
                      <span className="md:hidden text-stone-500 font-sans font-medium">Time</span>
                      {j.createdAt ? new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (j.time || 'Just now')}
                    </td>

                    {/* Status */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 pb-1 md:pb-4">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Status</span>
                      {(j.status === 'PRINTED_SUCCESSFULLY' || j.status === 'Printed') ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Printed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" /> {j.status?.replace(/_/g, ' ') || 'Processing'}
                        </span>
                      )}
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
