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
                  <td colSpan="6" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                      <span className="font-semibold text-xs text-stone-400">Loading transactions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : transactionsData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500 text-sm font-medium">
                    No transactions recorded in database yet.
                  </td>
                </tr>
              ) : (
                transactionsData.map((t, idx) => {
                  const txId = t.paymentTxnId || t.jobId || t.id || t._id || `TXN_${idx + 1}`
                  const shopTitle = t.shopId?.shopName || t.shop || t.shopCode || 'General Kiosk'
                  const gateway = t.paymentGateway || t.gateway || 'Razorpay UPI'
                  const amt = t.totalAmount ?? t.amount ?? 0
                  const timeFormatted = t.createdAt
                    ? new Date(t.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : t.time || 'Recent'
                  const isSuccess = t.status === 'PRINTED_SUCCESSFULLY' || t.status === 'COMPLETED' || t.status === 'PAID' || t.status === 'Success'

                  return (
                    <tr key={t._id || t.id || idx} className="hover:bg-stone-900/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs select-all">{txId}</td>
                      <td className="py-4 px-4 font-semibold text-stone-200">{shopTitle}</td>
                      <td className="py-4 px-4 text-xs font-bold text-rose-400 uppercase tracking-wider">{gateway}</td>
                      <td className="py-4 px-4 font-extrabold text-white">₹{amt}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-400">{timeFormatted}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {(() => {
                          const s = String(t.status || '').toUpperCase()
                          if (s.includes('PRINTED') || s === 'COMPLETED' || s === 'SUCCESS' || s === 'PAID') {
                            return (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full border bg-emerald-950 text-emerald-300 border-emerald-900 whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>Printed</span>
                              </span>
                            )
                          }
                          if (s.includes('DISPATCH') || s === 'PRINTING' || s === 'IN_QUEUE') {
                            return (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full border bg-sky-950 text-sky-300 border-sky-900 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                                <span>Dispatch</span>
                              </span>
                            )
                          }
                          if (s.includes('FAIL') || s.includes('CANCEL') || s.includes('REJECT') || s.includes('ERROR')) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full border bg-rose-950 text-rose-300 border-rose-900 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                <span>Failed</span>
                              </span>
                            )
                          }
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full border bg-amber-950 text-amber-300 border-amber-900 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>Pending</span>
                            </span>
                          )
                        })()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
