import { useState, useEffect, Fragment } from 'react'
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
  X,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useJobStore } from '../../store/useJobStore'
import TableSkeleton from '../../components/skeleton/TableSkeleton'

export default function OwnerJobs() {
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const { jobs, pagination, fetchJobs, refreshJobs, isLoading, isRefreshing } = useJobStore()

  useEffect(() => {
    fetchJobs(currentPage, 10, statusFilter)
  }, [fetchJobs, currentPage, statusFilter])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleStatusChange = (st) => {
    setStatusFilter(st)
    setCurrentPage(1)
  }

  const handleRefresh = async () => {
    if (cooldown > 0) {
      toast(`Queue is already up to date! Wait ${cooldown}s`, {
        id: 'cooldown-toast',
        icon: '⏳',
      })
      return
    }
    const nextCooldown = await refreshJobs(currentPage, 10, statusFilter)
    if (typeof nextCooldown === 'number' && nextCooldown > 0) {
      setCooldown(nextCooldown)
    }
  }

  const handleSearchSubmit = async (e) => {
    e?.preventDefault()
    const query = searchInput.trim()

    if (!query) {
      toast.error('Please enter a Job ID, filename, or phone number to search', {
        id: 'search-empty-warn',
      })
      return
    }

    try {
      setIsSearching(true)
      setAppliedSearch(query)
      setCurrentPage(1)
      await fetchJobs(1, 10, statusFilter)

      // Check results from store
      const currentJobs = useJobStore.getState().jobs || []
      const q = query.toLowerCase()
      const matchCount = currentJobs.filter((j) => {
        const fileName = (j.originalFileName || j.file || '').toLowerCase()
        const jobId = (j.jobId || j.id || '').toLowerCase()
        const phone = (j.customerPhone || '').toLowerCase()
        return fileName.includes(q) || jobId.includes(q) || phone.includes(q)
      }).length

      if (matchCount > 0) {
        toast.success(`Found ${matchCount} matching order${matchCount > 1 ? 's' : ''}!`, {
          id: 'search-result-toast',
        })
      } else {
        toast.error(`No orders found matching "${query}"`, {
          id: 'search-result-toast',
        })
      }
    } catch (err) {
      toast.error('Search failed, please try again')
    } finally {
      setIsSearching(false)
    }
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
              Print Orders Queue & History
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-0.5 font-medium">
            Monitor real-time incoming auto-print documents and order statuses
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing || isSearching || cooldown > 0}
          className={`btn btn-sm flex items-center gap-2 transition-all ${cooldown > 0
              ? 'bg-stone-100! text-stone-400! border border-stone-200! cursor-not-allowed'
              : 'btn-secondary bg-stone-200! hover:bg-stone-300! text-stone-800!'
            }`}
        >
          {isRefreshing || isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
          ) : (
            <RefreshCw className={`w-4 h-4 ${cooldown > 0 ? 'text-stone-400' : ''}`} />
          )}
          <span>
            {isRefreshing
              ? 'Refreshing...'
              : cooldown > 0
                ? `Refresh in ${cooldown}s`
                : 'Refresh Queue'}
          </span>
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
            disabled={isSearching || isLoading}
            className="btn btn-primary h-10 px-4 text-xs font-extrabold flex items-center gap-1.5 shrink-0 rounded-xl shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
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
                <th className="py-3.5 px-3 md:w-[15%]">Job ID</th>
                <th className="py-3.5 px-3 md:w-[21%]">Document File</th>
                <th className="py-3.5 px-3 md:w-[10%]">Customer</th>
                <th className="py-3.5 px-3 md:w-[10%]">Pages / Copies</th>
                <th className="py-3.5 px-3 md:w-[6%]">Type</th>
                <th className="py-3.5 px-3 md:w-[7%]">Amount</th>
                <th className="py-3.5 px-3 md:w-[9%]">Time</th>
                <th className="py-3.5 px-3 md:w-[10%] text-center">Status</th>
                <th className="py-3.5 px-3 md:w-[12%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-stone-100">
              {isLoading && jobs.length === 0 ? (
                <TableSkeleton
                  rows={8}
                  columns={[
                    { width: 'w-20', label: 'Job ID' },
                    { width: 'w-48', label: 'File Name' },
                    { width: 'w-28', label: 'Customer' },
                    { width: 'w-24', label: 'Pages/Copies' },
                    { width: 'w-16', label: 'Type' },
                    { width: 'w-14', label: 'Amount' },
                    { width: 'w-16', label: 'Time' },
                    { width: 'w-20', label: 'Status' },
                    { width: 'w-16', label: 'Actions' },
                  ]}
                />
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-stone-500 font-medium">
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

                    {/* File Name */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 overflow-hidden">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">File</span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
                        <span className="font-bold text-stone-800 truncate block text-xs" title={j.originalFileName || j.fileName || 'document.pdf'}>
                          {j.originalFileName || j.fileName || 'document.pdf'}
                        </span>
                      </div>
                    </td>

                    {/* Customer Phone */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 text-xs font-medium text-stone-600 overflow-hidden">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Customer</span>
                      <span className="truncate block">{j.customerPhone ? `+91 ${j.customerPhone}` : 'Counter Walk-in'}</span>
                    </td>

                    {/* Pages & Copies */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 text-xs font-medium text-stone-600 overflow-hidden">
                      <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Pages/Copies</span>
                      <span className="truncate block">{j.totalPages || 1}p × {j.copies || 1}c {j.isDuplex ? '(2-Sided)' : ''}</span>
                    </td>

                    {/* Type */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 whitespace-nowrap">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Type</span>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${(j.colorType === 'COLOR' || j.type === 'Color')
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
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 pb-1 md:pb-4 whitespace-nowrap text-center">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Status</span>
                      <div className="flex items-center md:justify-center">
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
                                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping shrink-0" />
                                <span>Auto-Printing</span>
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
                              <span>Pending Payment</span>
                            </span>
                          )
                        })()}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-3 whitespace-nowrap text-right">
                      <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Actions</span>
                      <div className="flex items-center justify-end gap-1.5">
                        {(() => {
                          const s = String(j.status || '').toUpperCase()
                          const isBusy = actionLoadingId === j.jobId

                          if (s.includes('PRINTED') || s === 'COMPLETED' || s === 'SUCCESS') {
                            return (
                              <>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().triggerPrintNow(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Reprint copy on hardware printer"
                                  className="btn btn-xs bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-stone-500" /> : <Printer className="w-3 h-3 text-stone-600" />}
                                  <span>Reprint</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().deleteJob(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Delete completed order from database"
                                  className="btn btn-xs bg-stone-50 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-stone-500" /> : <Trash2 className="w-3 h-3 text-stone-500" />}
                                  <span>Delete</span>
                                </button>
                              </>
                            )
                          }
                          if (s.includes('FAIL') || s.includes('CANCEL')) {
                            return (
                              <>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().triggerPrintNow(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Retry / Reprint job to hardware printer"
                                  className="btn btn-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> : <RefreshCw className="w-3 h-3 text-amber-600" />}
                                  <span>Reprint</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().deleteJob(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Delete failed order"
                                  className="btn btn-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )
                          }
                          if (s.includes('DISPATCH') || s === 'PRINTING') {
                            return (
                              <>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().triggerPrintNow(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Re-trigger print to printer"
                                  className="btn btn-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-sky-600" /> : <Printer className="w-3 h-3" />}
                                  <span>Reprint</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(j.jobId)
                                    await useJobStore.getState().cancelJob(j.jobId)
                                    setActionLoadingId(null)
                                  }}
                                  disabled={isBusy}
                                  title="Cancel print job"
                                  className="btn btn-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            )
                          }
                          return (
                            <>
                              <button
                                onClick={async () => {
                                  setActionLoadingId(j.jobId)
                                  await useJobStore.getState().triggerPrintNow(j.jobId)
                                  setActionLoadingId(null)
                                }}
                                disabled={isBusy}
                                title="Override and print immediately"
                                className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-extrabold px-2.5 py-1 flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Printer className="w-3 h-3" />}
                                <span>{isBusy ? 'Printing...' : 'Print'}</span>
                              </button>
                              <button
                                onClick={async () => {
                                  setActionLoadingId(j.jobId)
                                  await useJobStore.getState().cancelJob(j.jobId)
                                  setActionLoadingId(null)
                                }}
                                disabled={isBusy}
                                title="Cancel and delete print job from queue"
                                className="btn btn-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            </>
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
                    <Fragment key={p}>
                      {prev && p - prev > 1 && (
                        <span className="px-1 text-xs text-stone-400 font-mono">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all ${currentPage === p
                            ? 'bg-brand text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                      >
                        {p}
                      </button>
                    </Fragment>
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
