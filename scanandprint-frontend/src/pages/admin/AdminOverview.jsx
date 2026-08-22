import { useEffect, useState, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  Store,
  Printer,
  Monitor,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Sliders,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import AdminDemoTimer from '../../components/ui/AdminDemoTimer'
import AdminExpiringAlerts from '../../components/admin/AdminExpiringAlerts'
import MetricCardSkeleton from '../../components/skeleton/MetricCardSkeleton'
import TableSkeleton from '../../components/skeleton/TableSkeleton'
import ChartSkeleton from '../../components/skeleton/ChartSkeleton'

const AdminAnalyticsCharts = lazy(() => import('../../components/admin/AdminAnalyticsCharts'))
const AdminShopActionModal = lazy(() => import('../../components/admin/AdminShopActionModal'))

export default function AdminOverview() {
  const {
    overviewLoading,
    overviewData,
    recentShops,
    fetchOverview,
    analyticsData,
    analyticsLoading,
    fetchAnalytics,
  } = useAdminStore()

  const [selectedShop, setSelectedShop] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchOverview()
    fetchAnalytics()
  }, [fetchOverview, fetchAnalytics])

  const stats = overviewData || {}

  const handleOpenShopModal = (shop) => {
    setSelectedShop(shop)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Metric Cards Grid */}
      {overviewLoading && !overviewData ? (
        <MetricCardSkeleton count={4} variant="dark" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Platform GMV */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Platform GMV
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-950/80 text-brand border border-rose-900/60">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
            </h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Verified Revenue
            </span>
          </div>
        </motion.div>

        {/* Active Shops */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Active Print Shops
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-900/60">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              {stats.totalShops ?? 0}
            </h3>
            <span className="text-xs font-medium text-stone-400 mt-1 block">
              Registered Across India
            </span>
          </div>
        </motion.div>

        {/* Total Print Jobs & Pages */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Print Jobs
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-900/60">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white font-heading">
              {stats.totalJobs !== undefined ? stats.totalJobs.toLocaleString('en-IN') : (stats.totalPrints ? stats.totalPrints.toLocaleString('en-IN') : 0)}
            </h3>
            <span className="text-xs font-medium text-stone-400 mt-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              {stats.totalPrints ? stats.totalPrints.toLocaleString('en-IN') : 0} Total Pages Printed
            </span>
          </div>
        </motion.div>

        {/* Desktop Print Agents Online */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Desktop Agents Live
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-900/60">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-3xl font-extrabold text-white font-heading">
                {stats.totalAgents ?? 0}
              </h3>
            </div>
            <span className="text-xs font-medium text-emerald-400 mt-1 block">
              Real-time Socket Connected
            </span>
          </div>
        </motion.div>

      </div>
      )}

      {/* Priority Expiring Alerts */}
      <AdminExpiringAlerts expiringShops={analyticsData?.expiringSoonShops || []} />

      {/* Recharts Analytics & Visual Graphs */}
      <Suspense fallback={<ChartSkeleton />}>
        <AdminAnalyticsCharts analyticsData={analyticsData} loading={analyticsLoading} />
      </Suspense>

      {/* Recent Onboarded Shops Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-white font-heading">Recently Onboarded Shops</h3>
            <p className="text-xs text-stone-400 mt-0.5">Real-time status, subscription plan & agent connectivity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Plan Type</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-center">Actions</th>
                <th className="py-3 px-4 text-right">Agent Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {overviewLoading && recentShops.length === 0 ? (
                <TableSkeleton
                  variant="dark"
                  rows={5}
                  columns={[
                    { width: 'w-16', label: 'Code' },
                    { width: 'w-40', label: 'Shop Name' },
                    { width: 'w-28', label: 'Owner Name' },
                    { width: 'w-32', label: 'Location' },
                    { width: 'w-20', label: 'Plan Type' },
                    { width: 'w-20', label: 'Subscription' },
                    { width: 'w-16', label: 'Actions' },
                    { width: 'w-20', label: 'Agent Status' },
                  ]}
                />
              ) : recentShops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-stone-500 text-sm">
                    No shops onboarded yet.
                  </td>
                </tr>
              ) : (
                recentShops.map((s) => {
                  const pType = s.planType || s.plan || (s.isDemoAccount ? 'FREE_TRIAL' : 'MONTHLY_299')
                  const subStatus = s.status || (s.isDemoAccount ? 'Demo Active' : 'Active')
                  const isOnline = Boolean(s.isOnline)

                  return (
                    <tr key={s.shopCode || s._id} className="hover:bg-stone-900/60 transition-colors whitespace-nowrap">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs select-all">
                        {s.shopCode || s.code || '—'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-stone-200">
                        {s.shopName || s.name || '—'}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-300">
                        {s.ownerName || s.owner || '—'}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-400">
                        {s.cityState || s.city || s.address || '—'}
                      </td>
                      <td className="py-4 px-4">
                        {pType === 'FREE_TRIAL' || s.isDemoAccount ? (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-xs whitespace-nowrap">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Free Demo (2-Hr)</span>
                            </span>
                            <AdminDemoTimer demoExpiresAt={s.demoExpiresAt} createdAt={s.createdAt} status={subStatus} />
                          </div>
                        ) : pType === 'YEARLY_799' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-800/80 whitespace-nowrap">
                            ₹799 / Yr (Yearly)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-900/60 whitespace-nowrap">
                            ₹299 / Mo (Monthly)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {s.isDemoAccount || pType === 'FREE_TRIAL' ? (
                          subStatus === 'Demo Active' || subStatus === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-950/90 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-800/80 shadow-xs whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Demo Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-900 whitespace-nowrap">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Demo Expired</span>
                            </span>
                          )
                        ) : subStatus === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900 whitespace-nowrap shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : subStatus === 'Expired' ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-rose-900 whitespace-nowrap">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-950/90 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-900 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{subStatus}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenShopModal(s)}
                          className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3 text-brand" />
                          <span>Manage</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-stone-900 text-stone-400 text-[11px] font-extrabold px-3 py-1 rounded-full border border-stone-800 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-stone-500" /> Offline
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Action & History Modal */}
      {modalOpen && (
        <Suspense fallback={null}>
          <AdminShopActionModal
            shop={selectedShop}
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false)
              setSelectedShop(null)
            }}
          />
        </Suspense>
      )}

    </div>
  )
}
