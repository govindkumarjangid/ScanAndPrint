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
      
      {/* Title Header */}
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
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-white text-brand shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
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
            <tbody className="divide-y divide-stone-100">
              {filteredJobs.map((j) => (
                <tr key={j.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-stone-900 font-mono text-xs">{j.id}</td>
                  <td className="py-4 px-4 font-semibold text-stone-800">{j.file}</td>
                  <td className="py-4 px-4 text-xs font-mono text-stone-600">{j.customerPhone}</td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-600">
                    {j.pages} pages × {j.copies} copy
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                        j.type === 'Color'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {j.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-stone-900">₹{j.amount}</td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-500">{j.time}</td>
                  <td className="py-4 px-4">
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
