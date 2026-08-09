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

const recentJobs = [
  {
    id: 'JOB_98234_108',
    file: 'Aadhaar_Card_Copy.pdf',
    pages: 2,
    copies: 1,
    type: 'B&W',
    amount: 10,
    time: '2 mins ago',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_107',
    file: 'College_Project_Report.pdf',
    pages: 14,
    copies: 1,
    type: 'Color',
    amount: 140,
    time: '15 mins ago',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_106',
    file: 'PAN_Card_Verification.jpg',
    pages: 1,
    copies: 2,
    type: 'Color',
    amount: 20,
    time: '32 mins ago',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_105',
    file: 'Resume_Rahul_Kumar.pdf',
    pages: 3,
    copies: 2,
    type: 'B&W',
    amount: 30,
    time: '1 hour ago',
    status: 'Printed',
  },
]

export default function OwnerOverview() {
  return (
    <div className="flex flex-col gap-8">

      {/* Title */}
      <div className="flex flex-col gap-0.5 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-[28px] leading-tight font-extrabold text-stone-900 tracking-tight font-heading">
          Sharma Cyber Cafe
        </h1>
        <p className="text-sm sm:text-[15px] text-stone-500 font-medium">
          Cyber Café & Automated Printing
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
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">₹1,480</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% from yesterday
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
              Print Orders Today
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">42</h3>
            <span className="text-xs font-medium text-stone-500 mt-1 block">
              100% Auto-printed
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
            <h3 className="text-3xl font-extrabold text-stone-900 font-heading">186</h3>
            <span className="text-xs font-medium text-stone-500 mt-1 block">
              142 B&W · 44 Color
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
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-lg font-extrabold text-stone-900">PC Agent Online</h3>
            </div>
            <span className="text-xs font-medium text-emerald-700 mt-1 block">
              Epson L3210 (Ready)
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
          <Link to="/owner/qr-code" className="w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto justify-center bg-stone-900 text-white font-extrabold px-5 py-3.5 sm:py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:bg-stone-800 transition-colors cursor-pointer">
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
          <Link to="/owner/agent" className="w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto justify-center bg-white text-brand font-extrabold px-5 py-3.5 sm:py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:bg-rose-50 transition-colors cursor-pointer">
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
              {recentJobs.map((j) => (
                <tr key={j.id}
                  className="block md:table-row bg-stone-50/40 md:bg-transparent border border-stone-200/80 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0 hover:bg-stone-50/60 transition-colors"
                >
                  {/* Job ID */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-bold text-stone-900 font-mono text-xs">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Job ID</span>
                    {j.id}
                  </td>

                  {/*  File Name */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-semibold text-stone-800">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">File</span>
                    <span className="truncate max-w-40 text-right md:text-left md:max-w-none">{j.file}</span>
                  </td>

                  {/* Pages & Copies */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 text-xs font-medium text-stone-600">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Details</span>
                    <span>{j.pages} pages × {j.copies} copy</span>
                  </td>

                  {/* Type */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Type</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${j.type === 'Color'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-800'
                        }`}
                    >
                      {j.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-3.5">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Amount</span>
                    ₹{j.amount}
                  </td>

                  {/* Status */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4 pb-1 md:pb-3.5">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Status</span>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Printed
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
