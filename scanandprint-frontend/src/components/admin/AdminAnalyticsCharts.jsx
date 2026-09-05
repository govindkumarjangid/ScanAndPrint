import { useState, useMemo, memo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  TrendingUp,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react'
import SkeletonBase from '../skeleton/SkeletonBase'

// Custom Solid Dark Tooltip for Charts
const CustomDarkTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-3 shadow-2xl shadow-black/90 text-xs flex flex-col gap-1.5 min-w-36 pointer-events-none z-50">
        {label ? (
          <div className="font-bold text-stone-300 border-b border-stone-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          </div>
        ) : null}
        {payload.map((entry, index) => {
          const isRevenue =
            entry.name?.toLowerCase().includes('revenue') || entry.dataKey === 'revenue'
          const formattedVal = isRevenue
            ? `₹${Number(entry.value || 0).toLocaleString('en-IN')}`
            : Number(entry.value || 0).toLocaleString('en-IN')

          return (
            <div
              key={`item-${entry.dataKey || index}`}
              className="flex items-center justify-between gap-3 text-stone-200"
            >
              <span className="flex items-center gap-1.5 font-medium text-stone-400 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">{entry.name}:</span>
              </span>
              <span className="font-extrabold text-white font-mono shrink-0">
                {formattedVal}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
})
CustomDarkTooltip.displayName = 'CustomDarkTooltip'

// Skeleton placeholder while analytics data is fetching
function AnalyticsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
      {/* 1. Trend Chart Skeleton */}
      <div className="lg:col-span-2 min-w-0 bg-stone-950 rounded-3xl p-6 sm:p-7 border border-stone-800 flex flex-col justify-between gap-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <SkeletonBase variant="dark" className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBase variant="dark" className="h-5 w-48 rounded-md" />
              <SkeletonBase variant="dark" className="h-3 w-64 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-1 self-start sm:self-auto">
            <SkeletonBase variant="dark" className="h-8 w-24 rounded-xl" />
            <SkeletonBase variant="dark" className="h-8 w-24 rounded-xl" />
            <SkeletonBase variant="dark" className="h-8 w-20 rounded-xl" />
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 pt-6 px-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <SkeletonBase
                variant="dark"
                className="w-full max-w-10 rounded-t-lg opacity-40"
                style={{ height: `${30 + (i % 4) * 20}%` }}
              />
              <SkeletonBase variant="dark" className="h-3 w-8 rounded-xs" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-800">
          <SkeletonBase variant="dark" className="h-12 w-full rounded-2xl" />
          <SkeletonBase variant="dark" className="h-12 w-full rounded-2xl" />
          <SkeletonBase variant="dark" className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* 2. Donut Breakdown Skeleton */}
      <div className="min-w-0 bg-stone-950 rounded-3xl p-6 sm:p-7 border border-stone-800 flex flex-col justify-between gap-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <SkeletonBase variant="dark" className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBase variant="dark" className="h-4.5 w-32 rounded-md" />
              <SkeletonBase variant="dark" className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <SkeletonBase variant="dark" className="h-7 w-20 rounded-xl" />
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          <div className="w-45 h-45 rounded-full border-20 border-stone-800 animate-pulse" />
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
          <SkeletonBase variant="dark" className="h-4 w-full rounded-md" />
          <SkeletonBase variant="dark" className="h-4 w-full rounded-md" />
          <SkeletonBase variant="dark" className="h-4 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function AdminAnalyticsCharts({
  analyticsData = {},
  loading = false,
}) {
  const [metricTab, setMetricTab] = useState('prints') // 'prints' | 'revenue' | 'jobs'
  const [donutTab, setDonutTab] = useState('plans') // 'plans' | 'health'

  // Safe Extraction of Props
  const rawDailyTrend = analyticsData?.dailyTrend
  const rawPlanBreakdown = analyticsData?.planBreakdown
  const rawStatusBreakdown = analyticsData?.statusBreakdown
  const metrics = analyticsData?.metrics || {}

  // 1. Memoized 7-Day Trend Timeline
  const chartData = useMemo(() => {
    if (Array.isArray(rawDailyTrend) && rawDailyTrend.length > 0) {
      return rawDailyTrend.map((item) => ({
        day: item.day || item.date || 'Day',
        prints: Math.max(0, Number(item.prints) || 0),
        revenue: Math.max(0, Number(item.revenue) || 0),
        jobs: Math.max(0, Number(item.jobs) || 0),
      }))
    }
    // Standard 7-Day fallback with 0 values
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day) => ({ day, prints: 0, revenue: 0, jobs: 0 }))
  }, [rawDailyTrend])

  const hasTrendActivity = useMemo(() => {
    return chartData.some((d) => d.prints > 0 || d.revenue > 0 || d.jobs > 0)
  }, [chartData])

  // 2. Metrics (Strictly Real Zero-Safe Telemetry — No Fabricated Numbers)
  const freeTrialCount = Math.max(0, Number(metrics.freeTrialCount) || 0)
  const monthlyCount = Math.max(0, Number(metrics.monthlyCount) || 0)
  const yearlyCount = Math.max(0, Number(metrics.yearlyCount) || 0)
  const activeSubsCount = monthlyCount + yearlyCount

  const totalShopsFromPlans = freeTrialCount + activeSubsCount
  const conversionRate =
    metrics.conversionRate !== undefined
      ? Math.max(0, Number(metrics.conversionRate) || 0)
      : totalShopsFromPlans > 0
        ? Math.round((activeSubsCount / totalShopsFromPlans) * 100)
        : 0

  // 3. Plan Breakdown Data
  const planData = useMemo(() => {
    if (Array.isArray(rawPlanBreakdown) && rawPlanBreakdown.length > 0) {
      return rawPlanBreakdown.map((p) => ({
        name: p.name || 'Plan',
        value: Math.max(0, Number(p.value) || 0),
        color: p.color || '#f43f5e',
      }))
    }
    return [
      { name: 'Free Demo (48-Hr)', value: freeTrialCount, color: '#f59e0b' },
      { name: 'Monthly (₹299)', value: monthlyCount, color: '#f43f5e' },
      { name: 'Yearly (₹799)', value: yearlyCount, color: '#a855f7' },
    ]
  }, [rawPlanBreakdown, freeTrialCount, monthlyCount, yearlyCount])

  const totalShopsCount = useMemo(() => {
    return planData.reduce((sum, p) => sum + (Number(p.value) || 0), 0)
  }, [planData])

  // 4. Job Health Breakdown Data
  const statusData = useMemo(() => {
    if (Array.isArray(rawStatusBreakdown) && rawStatusBreakdown.length > 0) {
      return rawStatusBreakdown.map((s) => ({
        name: s.name || 'Status',
        value: Math.max(0, Number(s.value) || 0),
        color: s.color || '#3b82f6',
      }))
    }
    const completed = Math.max(0, Number(metrics.completedJobs) || 0)
    const failed = Math.max(0, Number(metrics.failedJobs) || 0)
    const total = Math.max(0, Number(metrics.totalJobs) || 0)
    const pending = Math.max(0, total - completed - failed)
    return [
      { name: 'Printed Successfully', value: completed, color: '#10b981' },
      { name: 'Active / Printing', value: pending, color: '#3b82f6' },
      { name: 'Failed / Cancelled', value: failed, color: '#ef4444' },
    ]
  }, [rawStatusBreakdown, metrics.completedJobs, metrics.failedJobs, metrics.totalJobs])

  const totalJobsCount = useMemo(() => {
    return statusData.reduce((sum, s) => sum + (Number(s.value) || 0), 0)
  }, [statusData])

  // 5. Active Donut Slices & Center Counters
  const { currentDonutData, renderDonutSlices, donutTotal, isDonutEmpty, donutLabel } =
    useMemo(() => {
      const isPlans = donutTab === 'plans'
      const current = isPlans ? planData : statusData
      const total = isPlans ? totalShopsCount : totalJobsCount
      const nonZero = current.filter((p) => Number(p.value) > 0)
      const empty = nonZero.length === 0 || total === 0
      const slices = empty
        ? [{ name: isPlans ? 'No Active Shops' : 'No Print Jobs', value: 1, color: '#292524' }]
        : nonZero

      return {
        currentDonutData: current,
        renderDonutSlices: slices,
        donutTotal: total,
        isDonutEmpty: empty,
        donutLabel: isPlans ? 'SHOPS' : 'JOBS',
      }
    }, [donutTab, planData, statusData, totalShopsCount, totalJobsCount])

  // If loading and data is empty, show skeleton
  if (loading && (!analyticsData || Object.keys(analyticsData).length === 0)) {
    return <AnalyticsChartsSkeleton />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
      {/* 1. Main 7-Day Interactive Trend Area Chart */}
      <div className="lg:col-span-2 min-w-0 bg-stone-950 rounded-3xl p-6 sm:p-7 border border-stone-800 flex flex-col justify-between shadow-sm relative overflow-hidden">
        {/* Header with Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/80 text-brand border border-rose-900/60 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white tracking-tight font-heading truncate">
                Platform Activity &amp; Traffic Trends
              </h2>
              <p className="text-stone-400 text-xs font-medium truncate">
                Live 7-day telemetry across all onboarded print shops
              </p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div
            role="tablist"
            className="flex items-center gap-1 bg-stone-900 p-1 rounded-2xl border border-stone-800 self-start sm:self-auto shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={metricTab === 'prints'}
              onClick={() => setMetricTab('prints')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${metricTab === 'prints'
                ? 'bg-brand text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Pages Printed
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metricTab === 'revenue'}
              onClick={() => setMetricTab('revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${metricTab === 'revenue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Revenue (₹)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metricTab === 'jobs'}
              onClick={() => setMetricTab('jobs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${metricTab === 'jobs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Print Jobs
            </button>
          </div>
        </div>

        {/* Chart Rendering Area */}
        <div className="h-64 sm:h-72 w-full pt-4 min-w-0 relative select-none outline-none focus:outline-none **:outline-none **:focus:outline-none **:focus-visible:outline-none">
          {!hasTrendActivity && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pb-6">
              <span className="text-[11px] font-bold text-stone-500 bg-stone-900/80 px-3 py-1.5 rounded-full border border-stone-800">
                No activity recorded in the last 7 days
              </span>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0245c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f0245c" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="day"
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#292524' }}
              />
              <YAxis
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomDarkTooltip />} />
              {metricTab === 'prints' && (
                <Area
                  type="monotone"
                  dataKey="prints"
                  name="Pages Printed"
                  stroke="#f0245c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrints)"
                />
              )}
              {metricTab === 'revenue' && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}
              {metricTab === 'jobs' && (
                <Area
                  type="monotone"
                  dataKey="jobs"
                  name="Print Jobs"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Metrics Row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-800/80 text-center">
          <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
              Conversion Rate
            </span>
            <span className="text-sm sm:text-base font-black text-white font-mono">
              {conversionRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
              Active Paid Shops
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
              {activeSubsCount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
              Active Free Demos
            </span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
              {freeTrialCount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Subscription Plan & Job Health Distribution Donut Chart */}
      <div className="min-w-0 bg-stone-950 rounded-3xl p-6 sm:p-7 border border-stone-800 flex flex-col justify-between shadow-sm">
        {/* Header with Plan / Health Toggle */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 ${donutTab === 'plans'
                ? 'bg-purple-950/80 text-purple-400 border-purple-900/60'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-900/60'
                }`}
            >
              {donutTab === 'plans' ? <PieIcon className="w-4.5 h-4.5" /> : <Activity className="w-4.5 h-4.5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight font-heading truncate">
                {donutTab === 'plans' ? 'Shop Plan Breakdown' : 'Print Job Health'}
              </h2>
              <p className="text-stone-400 text-[11px] font-medium truncate">
                {donutTab === 'plans' ? 'Free Demos vs Paid' : 'Completion & Failure Rates'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-800 shrink-0">
            <button
              type="button"
              onClick={() => setDonutTab('plans')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${donutTab === 'plans'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Plans
            </button>
            <button
              type="button"
              onClick={() => setDonutTab('health')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${donutTab === 'health'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Health
            </button>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="h-48 w-full relative flex items-center justify-center min-w-0 my-2 select-none outline-none focus:outline-none **:outline-none **:focus:outline-none **:focus-visible:outline-none">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <PieChart>
              <Pie
                data={renderDonutSlices}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={isDonutEmpty ? 0 : 4}
                dataKey="value"
                isAnimationActive={!isDonutEmpty}
              >
                {renderDonutSlices.map((entry, index) => (
                  <Cell
                    key={`donut-cell-${index}`}
                    fill={entry.color}
                    stroke="#0c0a09"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {!isDonutEmpty && <Tooltip content={<CustomDarkTooltip />} />}
            </PieChart>
          </ResponsiveContainer>

          {/* Center Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-stone-400 tracking-wider uppercase">
              {donutLabel}
            </span>
            <span className="text-xl font-black text-white font-mono">
              {donutTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2 pt-2 border-t border-stone-800/80">
          {currentDonutData.map((item) => {
            const count = Number(item.value) || 0
            const pct = donutTotal > 0 ? Math.round((count / donutTotal) * 100) : 0
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-stone-400 font-medium truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-stone-500 font-mono">({pct}%)</span>
                  <span className="font-extrabold text-stone-200 font-mono">
                    {count.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}