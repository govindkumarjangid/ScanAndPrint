import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import AdminDeleteConfirmModal from '../../components/admin/AdminDeleteConfirmModal'
import { downloadCsv } from '../../utils/exportCsv'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import TableSkeleton from '../../components/skeleton/TableSkeleton'

export default function AdminTransactions() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [txnToDelete, setTxnToDelete] = useState(null)
  const { transactionsLoading, transactionsData, transactionsPagination, fetchTransactions, deleteTransaction } = useAdminStore()

  useEffect(() => {
    fetchTransactions(currentPage, 10, searchTerm, statusFilter)
  }, [fetchTransactions, currentPage, statusFilter])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    fetchTransactions(1, 10, searchTerm, statusFilter)
  }

  const handleExportTransactions = async () => {
    setIsExporting(true)
    try {
      const res = await api.get('/admin/export/transactions')
      if (res.data.success && res.data.data?.transactions) {
        const flat = res.data.data.transactions.map((t) => ({
          JobId: t.jobId || '—',
          ShopCode: t.shopCode || t.shopId?.shopCode || '—',
          ShopName: t.shopId?.shopName || '—',
          CustomerPhone: t.customerPhone || '—',
          Amount: `₹${t.totalAmount || 0}`,
          TotalPages: t.totalPages || 1,
          Copies: t.copies || 1,
          Status: t.status || '—',
          PaymentMode: t.paymentMode || 'ONLINE_UPI',
          CreatedAt: t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : '—',
        }))
        downloadCsv(flat, `ScanAndPrint_Transactions_${new Date().toISOString().split('T')[0]}.csv`)
        toast.success('Transactions CSV exported successfully!')
      }
    } catch (e) {
      toast.error('Failed to export transactions')
    } finally {
      setIsExporting(false)
    }
  }

  const pagination = transactionsPagination || {
    totalCount: transactionsData.length,
    currentPage,
    totalPages: Math.ceil(transactionsData.length / 10) || 1,
    limit: 10,
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Payment Transactions & Gateway Settlement
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 font-medium">
            Platform-wide customer payments and subscription transactions across India
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportTransactions}
            disabled={isExporting}
            className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-1.5 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-brand" />}
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchTransactions(currentPage, 10, searchTerm, statusFilter)}
            disabled={transactionsLoading}
            className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${transactionsLoading ? 'animate-spin text-rose-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search by Txn ID, Job ID, or Shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-3 py-2"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-8 pr-8 py-2 text-xs text-stone-300 font-bold appearance-none cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">All Statuses</option>
              <option value="PRINTED_SUCCESSFULLY">🟢 Printed</option>
              <option value="DISPATCHED_TO_AGENT">🔵 Dispatch</option>
              <option value="PENDING_PAYMENT">🟡 Pending</option>
              <option value="PRINT_FAILED">🔴 Failed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>
        </div>
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
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {transactionsLoading && transactionsData.length === 0 ? (
                <TableSkeleton
                  variant="dark"
                  rows={8}
                  columns={[
                    { width: 'w-24', label: 'Transaction ID' },
                    { width: 'w-40', label: 'Shop Name' },
                    { width: 'w-20', label: 'Gateway' },
                    { width: 'w-16', label: 'Amount' },
                    { width: 'w-24', label: 'Time' },
                    { width: 'w-20', label: 'Status' },
                    { width: 'w-12', label: 'Action' },
                  ]}
                />
              ) : transactionsData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500 text-sm font-medium">
                    No transactions match the criteria.
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

                  return (
                    <tr key={t._id || t.id || idx} className="hover:bg-stone-900/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs select-all">{txId}</td>
                      <td className="py-4 px-4 font-semibold text-stone-200">{shopTitle}</td>
                      <td className="py-4 px-4 text-xs font-bold text-rose-400 uppercase tracking-wider">{gateway}</td>
                      <td className="py-4 px-4 font-extrabold text-white">₹{amt}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-400">{timeFormatted}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
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
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setTxnToDelete(t)}
                          title="Delete Transaction Record"
                          className="p-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/80 text-stone-400 hover:text-rose-400 border border-stone-800 hover:border-rose-800 text-xs transition-all cursor-pointer inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-stone-800">
            <span className="text-xs font-medium text-stone-400">
              Showing page <strong className="text-white">{pagination.currentPage}</strong> of <strong className="text-white">{pagination.totalPages}</strong> ({pagination.totalCount} transactions)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1 || transactionsLoading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-stone-300 px-2">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage >= pagination.totalPages || transactionsLoading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Approve Popup for Deleting Transaction */}
      {txnToDelete && (
        <AdminDeleteConfirmModal
          isOpen={Boolean(txnToDelete)}
          onClose={() => setTxnToDelete(null)}
          onConfirm={async () => {
            await deleteTransaction(txnToDelete._id || txnToDelete.id)
          }}
          title="Delete Transaction Record"
          itemType="transaction"
          itemData={txnToDelete}
        />
      )}

    </div>
  )
}
