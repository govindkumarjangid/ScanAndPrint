import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, CheckCircle2, RefreshCw, Printer } from 'lucide-react'

const initialJobs = [
  {
    id: 'JOB_98234_108',
    file: 'Aadhaar_Card_Copy.pdf',
    customerPhone: '9876543210',
    pages: 2,
    copies: 1,
    type: 'B&W',
    amount: 10,
    time: '10:42 AM',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_107',
    file: 'College_Project_Report.pdf',
    customerPhone: '9812345678',
    pages: 14,
    copies: 1,
    type: 'Color',
    amount: 140,
    time: '10:30 AM',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_106',
    file: 'PAN_Card_Verification.jpg',
    customerPhone: '9765432109',
    pages: 1,
    copies: 2,
    type: 'Color',
    amount: 20,
    time: '10:15 AM',
    status: 'Printed',
  },
  {
    id: 'JOB_98234_105',
    file: 'Resume_Rahul_Kumar.pdf',
    customerPhone: '9988776655',
    pages: 3,
    copies: 2,
    type: 'B&W',
    amount: 30,
    time: '09:50 AM',
    status: 'Printed',
  },
]

export default function OwnerJobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredJobs = initialJobs.filter((j) => {
    const matchesSearch =
      j.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.customerPhone.includes(searchTerm)
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter
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

        <button className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer w-max">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
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
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
          {['ALL', 'Printed', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 w-full rounded-lg text-xs font-extrabold cursor-pointer transition-all ${statusFilter === st
                ? 'bg-brand text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
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
              {filteredJobs.map((j) => (
                <tr
                  key={j.id}
                  className="block md:table-row bg-stone-50/40 md:bg-transparent border border-stone-200/80 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0 hover:bg-stone-50/60 transition-colors"
                >
                  {/* Job ID */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-bold text-stone-900 font-mono text-xs">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Job ID</span>
                    {j.id}
                  </td>

                  {/* Document File */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-semibold text-stone-800">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium shrink-0">File</span>
                    <span className="truncate max-w-37.5 sm:max-w-50 text-right md:text-left md:max-w-none">{j.file}</span>
                  </td>

                  {/* Customer */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-mono text-stone-600">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Customer</span>
                    {j.customerPhone}
                  </td>

                  {/* Pages / Copies */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-medium text-stone-600">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Details</span>
                    <span>{j.pages} pages × {j.copies} copy</span>
                  </td>

                  {/* Type */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4">
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

                  {/* Amount  */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 font-extrabold text-stone-900 border-t border-stone-100 md:border-0 mt-2 pt-3 md:mt-0 md:pt-4">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Amount</span>
                    ₹{j.amount}
                  </td>

                  {/* Time */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 text-xs font-medium text-stone-500">
                    <span className="md:hidden text-stone-500 font-sans font-medium">Time</span>
                    {j.time}
                  </td>

                  {/* Status */}
                  <td className="flex justify-between items-center md:table-cell py-2 md:py-4 px-0 md:px-4 pb-1 md:pb-4">
                    <span className="md:hidden text-stone-500 font-sans text-xs font-medium">Status</span>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {j.status}
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
