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
  FileText,
  Sliders,
  User,
  MapPin,
} from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
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
      <div className="bg-stone-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-stone-800 flex flex-col gap-4 sm:gap-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">Recently Onboarded Shops</h3>
              {recentShops.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-stone-900 border border-stone-800 text-stone-400">
                  {recentShops.length}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Real-time status & subscription info</p>
          </div>
        </div>

        {/* Mobile View: Clean Responsive Card Stack (< md) */}
        <div className="md:hidden flex flex-col gap-3">
          {overviewLoading && recentShops.length === 0 ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 animate-pulse flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-stone-800 rounded w-28" />
                    <div className="h-4 bg-stone-800 rounded w-16" />
                  </div>
                  <div className="h-3 bg-stone-800/60 rounded w-36" />
                  <div className="h-10 bg-stone-800/40 rounded-xl" />
                </div>
              ))}
            </div>
          ) : recentShops.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-sm bg-stone-900/20 rounded-2xl border border-dashed border-stone-800">
              No shops onboarded yet.
            </div>
          ) : (
            recentShops.map((s) => {
              const pType = s.planType || s.plan || (s.isDemoAccount ? 'FREE_TRIAL' : 'MONTHLY_299')
              const subStatus = s.status || (s.isDemoAccount ? 'Demo Active' : 'Active')

              return (
                <div
                  key={s.shopCode || s._id}
                  className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800/80 hover:border-stone-700/80 transition-all flex flex-col gap-3"
                >
                  {/* Top Bar: Shop Name, Code & Subscription Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">
                        {s.shopName || s.name || '—'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-rose-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800 select-all">
                          {s.shopCode || s.code || '—'}
                        </span>
                        <span className="text-stone-600 text-xs">•</span>
                        <span className="text-stone-300 text-xs font-medium flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-stone-500 shrink-0" />
                          <span className="truncate">{s.ownerName || s.owner || '—'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Subscription Status Pill */}
                    <div className="shrink-0">
                      {s.isDemoAccount || pType === 'FREE_TRIAL' ? (
                        subStatus === 'Demo Active' || subStatus === 'Active' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-800/80 shadow-xs">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            <span>Demo Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-950/90 text-rose-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-rose-900">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            <span>Demo Expired</span>
                          </span>
                        )
                      ) : subStatus === 'Active' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-950/90 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-900 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Active</span>
                        </span>
                      ) : subStatus === 'Expired' ? (
                        <span className="inline-flex items-center gap-1 bg-rose-950/90 text-rose-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-rose-900">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>Expired</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-900">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{subStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location if present */}
                  {(s.cityState || s.city || s.address) && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 truncate">
                      <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                      <span className="truncate">{s.cityState || s.city || s.address}</span>
                    </div>
                  )}

                  {/* Manage Button */}
                  <button
                    onClick={() => handleOpenShopModal(s)}
                    className="w-full h-10 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-stone-200 hover:text-white border border-stone-800 hover:border-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-brand" />
                    <span>Manage</span>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-160">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-center">Actions</th>
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
                    { width: 'w-24', label: 'Subscription' },
                    { width: 'w-16', label: 'Actions' },
                  ]}
                />
              ) : recentShops.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-500 text-sm">
                    No shops onboarded yet.
                  </td>
                </tr>
              ) : (
                recentShops.map((s) => {
                  const pType = s.planType || s.plan || (s.isDemoAccount ? 'FREE_TRIAL' : 'MONTHLY_299')
                  const subStatus = s.status || (s.isDemoAccount ? 'Demo Active' : 'Active')

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
