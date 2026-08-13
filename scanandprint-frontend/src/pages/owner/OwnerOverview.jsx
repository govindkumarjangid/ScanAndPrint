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
} from 'lucide-react'

import { useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useJobStore } from '../../store/useJobStore'

export default function OwnerOverview() {
  const { currentShop, fetchProfile } = useAuthStore()
  const { jobs, analytics, fetchJobs, fetchAnalytics, isLoading } = useJobStore()

  useEffect(() => {
    fetchProfile()
    fetchJobs(1, 10)
    fetchAnalytics()
  }, [fetchProfile, fetchJobs, fetchAnalytics])

  const shopName = currentShop?.shopName || 'Print Shop'
  const shopLocation = currentShop?.address || currentShop?.cityState || 'Local Shop'
  const isOnline = currentShop?.isOnline ?? false
  const printersCount = currentShop?.connectedPrinters?.length || 0

  const todayRevenue = analytics?.todayRevenue ?? analytics?.totalRevenue ?? 0
  const totalRevenue = analytics?.totalRevenue ?? 0
  const totalJobs = analytics?.totalJobsCompleted ?? (jobs?.length || 0)
  const totalPages = analytics?.totalPagesPrinted ?? 0
  const bwCount = analytics?.bwJobsCount ?? 0
  const colorCount = analytics?.colorJobsCount ?? 0

  return (
    <div className="flex flex-col gap-8">

      {/* Title */}
      <div className="flex flex-col gap-0.5 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-[28px] leading-tight font-extrabold text-stone-900 tracking-tight font-heading">
          {shopName}
        </h1>
        <p className="text-sm sm:text-[15px] text-stone-500 font-medium">
          {shopLocation} {currentShop?.shopCode ? `· ID: ${currentShop.shopCode}` : ''}
        </p>
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
              <TrendingUp className="w-3.5 h-3.5" /> ₹{Number(totalRevenue).toLocaleString('en-IN')} Lifetime Earnings
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
            <div className={`p-2.5 rounded-2xl ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <h3 className="text-lg font-extrabold text-stone-900">PC Agent {isOnline ? 'Online' : 'Offline'}</h3>
            </div>
            <span className={`text-xs font-medium mt-1 block ${isOnline ? 'text-emerald-700' : 'text-stone-500'}`}>
              {isOnline
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

        <div className="w-full overflow-hidden md:overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-stone-200/80 text-stone-500 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Pages & Copies</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-stone-100">
              {isLoading ? (
                <tr><td colSpan="6" className="py-4 text-center text-sm text-stone-500">Loading jobs...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center text-sm text-stone-500">No print jobs found.</td></tr>
              ) : jobs.map((j) => (
                <tr key={j._id}
                  className="block md:table-row bg-stone-50/40 md:bg-transparent border border-stone-200/80 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0 hover:bg-stone-50/60 transition-colors"
                >
                  {/* Job ID */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-bold text-stone-900 font-mono text-xs">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Job ID</span>
                    {j.jobId}
                  </td>

                  {/*  File Name */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-semibold text-stone-800">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">File</span>
                    <span className="truncate max-w-40 text-right md:text-left md:max-w-none">{j.originalFileName}</span>
                  </td>

                  {/* Pages & Copies */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 text-xs font-medium text-stone-600">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Details</span>
                    <span>{j.totalPages} pages × {j.copies} copy</span>
                  </td>

                  {/* Type */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Type</span>
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
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-3.5">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Amount</span>
                    ₹{j.totalAmount}
                  </td>

                  {/* Status */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 pb-1 md:pb-3.5">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Status</span>
                    {j.status === 'PRINTED_SUCCESSFULLY' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Printed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600" /> {j.status.replace(/_/g, ' ')}
                      </span>
                    )}
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
