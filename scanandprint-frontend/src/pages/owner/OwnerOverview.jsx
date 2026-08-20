import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  FileText,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  QrCode,
  Download,
  ArrowUpRight,
  Loader2,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'
import { getSocket } from '../../lib/socket'
import api from '../../lib/axios'

export default function OwnerOverview() {
  const { currentShop, fetchProfile } = useAuthStore()
  const { jobs, analytics, fetchJobs, fetchAnalytics, isLoading } = useJobStore()
  const [isAgentOnline, setIsAgentOnline] = useState(false)
  const [livePrinters, setLivePrinters] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchJobs(1, 10)
    fetchAnalytics()
  }, [fetchProfile, fetchJobs, fetchAnalytics])

  useEffect(() => {
    const shopCode = currentShop?.shopCode || currentShop?._id
    if (!shopCode) return

    const socket = getSocket()
    const joinRoom = () => {
      socket.emit('JOIN_SHOP_DASHBOARD', { shopCode })
      socket.emit('CHECK_AGENT_STATUS', { shopCode })
    }

    if (socket.connected) {
      joinRoom()
    }
    socket.on('connect', joinRoom)

    const handleStatus = (data) => {
      if (data?.shopCode && data.shopCode !== shopCode) return
      setIsAgentOnline(Boolean(data?.isOnline))
      setLivePrinters(data?.printers || [])
    }

    socket.on('AGENT_STATUS_CHANGE', handleStatus)

    return () => {
      socket.off('connect', joinRoom)
      socket.off('AGENT_STATUS_CHANGE', handleStatus)
    }
  }, [currentShop?.shopCode, currentShop?._id])

  const shopName = currentShop?.shopName || 'Print Shop'
  const shopLocation = currentShop?.address || currentShop?.cityState || 'Local Shop'
  const printersCount = livePrinters.length || currentShop?.connectedPrinters?.length || 0

  const todayRevenue = analytics?.todayRevenue ?? analytics?.totalRevenue ?? 0
  const totalRevenue = analytics?.totalRevenue ?? 0
  const totalJobs = analytics?.totalJobsCompleted ?? (jobs?.length || 0)
  const totalPages = analytics?.totalPagesPrinted ?? 0
  const bwCount = analytics?.bwJobsCount ?? 0
  const colorCount = analytics?.colorJobsCount ?? 0

  return (
    <div className="flex flex-col gap-8">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 sm:px-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] leading-tight font-extrabold text-stone-900 tracking-tight font-heading">
              {shopName}
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
            </span>
          </div>
          <p className="text-sm sm:text-[15px] text-stone-500 font-medium">
            {shopLocation} {currentShop?.shopCode ? `· ID: ${currentShop.shopCode}` : ''}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Revenue */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Today's Revenue
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-50 text-brand">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">
              ₹{Number(todayRevenue).toLocaleString('en-IN')}
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> ₹{Number(totalRevenue).toLocaleString('en-IN')} Total Earnings
            </span>
          </div>
        </motion.div>

        {/* Orders Completed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Print Orders
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">
              {totalJobs}
            </h3>
            <span className="text-xs font-medium text-stone-500 mt-1 block">
              Successfully Processed
            </span>
          </div>
        </motion.div>

        {/* Total Pages Printed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pages Output
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">
              {totalPages}
            </h3>
            <span className="text-xs font-medium text-stone-500 mt-1 block">
              {bwCount} B&W · {colorCount} Color
            </span>
          </div>
        </motion.div>

        {/* Desktop Print Agent Status */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Print Agent Status
            </span>
            <div className={`p-2.5 rounded-2xl ${isAgentOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isAgentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <h3 className="text-lg font-extrabold text-stone-900">PC Agent {isAgentOnline ? 'Online' : 'Offline'}</h3>
            </div>
            <span className={`text-xs font-medium mt-1 block ${isAgentOnline ? 'text-emerald-700' : 'text-stone-500'}`}>
              {isAgentOnline
                ? (printersCount > 0 ? `${printersCount} Hardware Spooler(s) Ready` : 'Ready for Hardware Printing')
                : 'Launch Desktop Agent to Connect'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

        {/* Printable QR Banner Card */}
        <div className="bg-linear-to-br from-amber-400 to-amber-500 rounded-3xl p-5 sm:p-7 text-stone-900 shadow-sm sm:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-4 transition-all">
          <div className="flex flex-col gap-2 sm:gap-1.5">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider bg-stone-900/10 px-3 py-1 sm:py-0.5 rounded-full w-max">
              Counter Display
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold font-heading leading-tight">Print Your Shop QR Code</h3>
            <p className="text-xs sm:text-sm text-stone-800 font-medium opacity-90">Download high-res printable PDF poster for your shop counter.</p>
          </div>
          <Link to="/owner/qr-code" className="w-max shrink-0">
            <button className="btn btn-secondary w-auto sm:w-auto">
              <QrCode className="size-4 sm:size-5" />
              <span>Get Poster</span>
            </button>
          </Link>
        </div>

        {/* Print Agent Download Banner Card */}
        <div className="bg-linear-to-br from-brand to-rose-600 rounded-3xl p-5 sm:p-7 text-white shadow-sm sm:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-4 transition-all">
          <div className="flex flex-col gap-2 sm:gap-1.5">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 sm:py-0.5 rounded-full w-max">
              Windows PC App
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold font-heading leading-tight">Print Agent (.exe)</h3>
            <p className="text-xs sm:text-sm text-rose-100 font-medium opacity-90">Download background software for 1-click silent hardware printing.</p>
          </div>
          <Link to="/owner/agent" className="w-max shrink-0">
            <button className="btn btn-secondary bg-white! text-brand! hover:bg-rose-50! w-auto sm:w-auto">
              <Download className="size-4 sm:size-5" />
              <span>Download .exe</span>
            </button>
          </Link>
        </div>

      </div>

      {/* Recent Print Jobs Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3 sm:gap-0">
          <div>
            <h3 className="text-xl font-extrabold text-stone-900 font-heading">Recent Print Orders</h3>
            <p className="text-xs text-stone-500 mt-0.5">Real-time print jobs dispatched to your shop PC</p>
          </div>
          <Link to="/owner/jobs" className="text-xs font-extrabold text-brand hover:underline flex items-center gap-1 self-start sm:self-auto">
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-left text-sm border-collapse block md:table md:table-fixed">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-stone-200/80 text-stone-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 md:w-[20%]">Job ID</th>
                <th className="py-3 px-4 md:w-[28%]">File Name</th>
                <th className="py-3 px-4 md:w-[15%]">Pages & Copies</th>
                <th className="py-3 px-4 md:w-[8%]">Type</th>
                <th className="py-3 px-4 md:w-[7%]">Amount</th>
                <th className="py-3 px-4 md:w-[10%] text-center">Status</th>
                <th className="py-3 px-4 md:w-[12%] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-brand" />
                      <span className="text-sm font-semibold text-stone-700">Loading recent orders...</span>
                      <span className="text-xs text-stone-400">Fetching live updates from server</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-sm text-stone-500 font-medium">No print jobs found.</td></tr>
              ) : jobs.map((j) => (
                <tr key={j._id || j.jobId}
                  className="block md:table-row bg-stone-50/40 md:bg-transparent border border-stone-200/80 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0 hover:bg-stone-50/60 transition-colors"
                >
                  {/* Job ID */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-bold text-stone-900 font-mono text-xs overflow-hidden">
                    <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Job ID</span>
                    <span className="truncate block font-mono text-stone-900" title={j.jobId}>{j.jobId}</span>
                  </td>

                  {/* File Name */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-semibold text-stone-800 overflow-hidden">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0 mr-2">File</span>
                    <span
                      className="truncate block max-w-40 sm:max-w-70 md:max-w-full text-right md:text-left text-xs sm:text-sm font-medium text-stone-800"
                      title={j.originalFileName}
                    >
                      {j.originalFileName}
                    </span>
                  </td>

                  {/* Pages & Copies */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 text-xs font-medium text-stone-600 whitespace-nowrap overflow-hidden">
                    <span className="md:hidden text-stone-500 font-sans font-medium shrink-0">Details</span>
                    <span className="truncate block">{j.totalPages} pages × {j.copies} copy</span>
                  </td>

                  {/* Type */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 whitespace-nowrap">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Type</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${j.colorType === 'COLOR'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-800'
                        }`}
                    >
                      {j.colorType === 'COLOR' ? 'Color' : 'B&W'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-3.5 whitespace-nowrap">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Amount</span>
                    ₹{j.totalAmount}
                  </td>

                  {/* Status */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 pb-1 md:pb-3.5 whitespace-nowrap text-center">
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

                  {/* Actions Column */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 whitespace-nowrap text-right">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">Actions</span>
                    <div className="flex items-center justify-end gap-1.5">
                      {(() => {
                        const s = String(j.status || '').toUpperCase()
                        if (s.includes('PRINTED') || s === 'COMPLETED' || s === 'SUCCESS') {
                          return (
                            <button
                              onClick={() => useJobStore.getState().deleteJob(j.jobId)}
                              title="Delete completed order from database"
                              className="btn btn-xs bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200 hover:border-rose-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 text-stone-500" />
                              <span>Delete</span>
                            </button>
                          )
                        }
                        if (s.includes('FAIL') || s.includes('CANCEL')) {
                          return (
                            <button
                              onClick={() => useJobStore.getState().triggerPrintNow(j.jobId)}
                              title="Retry print"
                              className="btn btn-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>Retry</span>
                            </button>
                          )
                        }
                        return (
                          <>
                            <button
                              onClick={() => useJobStore.getState().triggerPrintNow(j.jobId)}
                              title="Approve & Send to printer"
                              className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-extrabold px-2.5 py-1 flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Print</span>
                            </button>
                            <button
                              onClick={() => useJobStore.getState().cancelJob(j.jobId)}
                              title="Cancel print job"
                              className="btn btn-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg text-[11px] font-bold px-2 py-1 flex items-center gap-1 transition-all cursor-pointer"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
