import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, IndianRupee, CheckCircle2, Loader2 } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminTransactions() {
  const { transactionsLoading, transactionsData, fetchTransactions } = useAdminStore()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Payment Transactions & Gateway Settlement
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Platform-wide UPI payments processed via PhonePe PG, Razorpay, and Paytm
        </p>
      </div>

      {/* Transactions Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {transactionsLoading ? (
                <tr>
                  <td colSpan="6" className="py-8">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactionsData.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-900/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-white font-mono text-xs">{t.id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-200">{t.shop}</td>
                    <td className="py-4 px-4 text-xs font-bold text-rose-400">{t.gateway}</td>
                    <td className="py-4 px-4 font-extrabold text-white">₹{t.amount}</td>
                    <td className="py-4 px-4 text-xs font-medium text-stone-400">{t.time}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {t.status}
                      </span>
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
