import { useState, useEffect } from 'react'
import {
  Laptop,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Cpu,
  Network,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  AlertOctagon,
  Eye,
  Copy,
  Terminal,
  Store,
} from 'lucide-react'
import api from '../../lib/axios'
import { getSocket } from '../../lib/socket'
import AdminDeviceTableSkeleton from '../../components/skeleton/AdminDeviceTableSkeleton'
import toast from 'react-hot-toast'

export default function AdminDevices() {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [suspiciousShops, setSuspiciousShops] = useState([])
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [selectedTelemetryDevice, setSelectedTelemetryDevice] = useState(null)

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const [devRes, suspRes] = await Promise.all([
        api.get(`/admin/devices?page=${currentPage}&limit=10&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`),
        api.get('/admin/devices/suspicious?threshold=4'),
      ])

      if (devRes.data.success && devRes.data.data) {
        setDevices(devRes.data.data.devices || [])
        setPagination(devRes.data.data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 })
      }

      if (suspRes.data.success && suspRes.data.data) {
        setSuspiciousShops(suspRes.data.data.suspicious || [])
      }
    } catch (err) {
      console.error('Failed to fetch admin devices:', err)
      toast.error('Could not load devices telemetry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) fetchDevices()
    }, 0)

    const socket = getSocket()
    const token = localStorage.getItem('adminToken')
    socket.emit('JOIN_ADMIN_ROOM', { token })

    const handleDeviceLiveUpdate = (data) => {
      if (data && (data.shopCode || data.shopId || data.deviceFingerprint)) {
        setDevices((prev) =>
          prev.map((d) => {
            const matches =
              (data.shopCode && d.shopId?.shopCode === data.shopCode) ||
              (data.shopId && String(d.shopId?._id || d.shopId) === String(data.shopId)) ||
              (data.deviceFingerprint && d.fingerprint === data.deviceFingerprint)

            if (matches) {
              const liveMeta = data.meta || {}
              return {
                ...d,
                meta: {
                  ...d.meta,
                  ...liveMeta,
                  ipAddress: data.ipAddress || liveMeta.ipAddress || d.meta?.ipAddress,
                  localIp: data.localIp || liveMeta.localIp || d.meta?.localIp,
                  defaultGateway: data.defaultGateway || liveMeta.defaultGateway || d.meta?.defaultGateway,
                },
                lastConnectedAt: new Date(),
              }
            }
            return d
          })
        )
      }
    }

    const handleSync = () => {
      fetchDevices()
    }

    socket.on('ADMIN_DEVICE_UPDATED', handleDeviceLiveUpdate)
    socket.on('ADMIN_LIVE_AGENT_UPDATE', handleDeviceLiveUpdate)
    socket.on('AGENT_STATUS_CHANGE', handleDeviceLiveUpdate)
    socket.on('ADMIN_NEW_DEVICE_PENDING', handleSync)

    return () => {
      isMounted = false
      clearTimeout(timer)
      socket.off('ADMIN_DEVICE_UPDATED', handleDeviceLiveUpdate)
      socket.off('ADMIN_LIVE_AGENT_UPDATE', handleDeviceLiveUpdate)
      socket.off('AGENT_STATUS_CHANGE', handleDeviceLiveUpdate)
      socket.off('ADMIN_NEW_DEVICE_PENDING', handleSync)
    }
  }, [currentPage, statusFilter])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    fetchDevices()
  }

  const handleAdminApprove = async (deviceId) => {
    try {
      setActionLoadingId(deviceId)
      const res = await api.post(`/admin/devices/${deviceId}/approve`)
      if (res.data.success) {
        toast.success('Device approved by Super Admin!')
        fetchDevices()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleAdminReject = async (deviceId) => {
    try {
      setActionLoadingId(deviceId)
      const res = await api.post(`/admin/devices/${deviceId}/reject`, { reason: 'Rejected by Super Admin' })
      if (res.data.success) {
        toast.success('Device request rejected by Super Admin!')
        fetchDevices()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleAdminRevoke = async (deviceId) => {
    try {
      setActionLoadingId(deviceId)
      const res = await api.post(`/admin/devices/${deviceId}/revoke`)
      if (res.data.success) {
        toast.success('Device revoked by Super Admin!')
        fetchDevices()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Revoke failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  const copyToClipboard = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-heading flex items-center gap-2.5 sm:gap-3">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 shrink-0" />
            <span>Hardware Device Bindings & Security</span>
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-0.5 font-medium">
            Strict hardware device binding telemetry: Monitor CPU, Motherboard Serial, System UUID, exact IP, and Gateway
          </p>
        </div>

        <button
          onClick={fetchDevices}
          disabled={loading}
          className="w-full sm:w-auto justify-center btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-2 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-500' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Suspicious Multi-Device Activity Alert */}
      {suspiciousShops.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm sm:text-base font-heading">
              <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 animate-pulse shrink-0" />
              <span>Potential Credential-Sharing Detected ({suspiciousShops.length} Shops)</span>
            </div>
            <span className="bg-rose-900/60 text-rose-300 text-[11px] sm:text-xs font-mono font-bold px-2.5 sm:px-3 py-1 rounded-full border border-rose-700">
              ≥ 4 Registered Device Fingerprints
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            The following shops have attempted to connect from 4 or more distinct physical PC hardware fingerprints, indicating possible API credential leakage or multi-store sharing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suspiciousShops.map((s) => (
              <div key={s._id} className="bg-stone-900/80 p-3.5 sm:p-4 rounded-2xl border border-rose-800/60 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs sm:text-sm truncate">{s.shopName}</span>
                  <span className="bg-rose-500/20 text-rose-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded shrink-0">
                    {s.totalDevices} PCs
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-mono flex items-center justify-between">
                  <span>Code: {s.shopCode}</span>
                  <span>{s.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-stone-950 rounded-2xl p-3 sm:p-4 border border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hostname, IP, motherboard serial, UUID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="relative w-full sm:w-48">
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
            <option value="APPROVED">🟢 Approved Only</option>
            <option value="PENDING_APPROVAL">🟡 Pending Approval</option>
            <option value="REVOKED">🟠 Revoked</option>
            <option value="REJECTED">🔴 Rejected</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
        </div>
      </div>

      {/* Main Devices Section Wrapper */}
      <div className="bg-stone-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-stone-800 shadow-sm flex flex-col gap-4">
        {/* Mobile View: Cards Layout (< md) */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800 animate-pulse flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-stone-800 rounded w-1/3" />
                  <div className="h-5 bg-stone-800 rounded-full w-20" />
                </div>
                <div className="h-24 bg-stone-950/60 rounded-xl border border-stone-800/40" />
                <div className="h-8 bg-stone-800 rounded-xl w-full" />
              </div>
            ))
          ) : devices.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm font-medium">
              No hardware devices match the criteria.
            </div>
          ) : (
            devices.map((d) => {
              const shop = d.shopId || {}
              const meta = d.meta || {}
              const isProcessing = actionLoadingId === d._id

              const exactIp = meta.ipAddress || meta.localIp || '—'
              const defaultGateway = meta.defaultGateway || '—'
              const mbSerial = meta.motherboardSerial && meta.motherboardSerial !== 'Unknown' ? meta.motherboardSerial : '—'
              const sysUuid = meta.systemUuid && meta.systemUuid !== '' ? meta.systemUuid : '—'

              return (
                <div
                  key={d._id}
                  className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800/80 hover:border-stone-700/80 transition-all flex flex-col gap-3"
                >
                  {/* Top: Shop Details & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {shop.shopName || 'Unknown Shop'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {shop.shopCode && (
                          <span className="font-mono text-[10px] font-bold text-rose-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 select-all">
                            {shop.shopCode}
                          </span>
                        )}
                        {shop.phone && (
                          <span className="text-stone-400 text-xs font-mono">
                            {shop.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                        d.status === 'APPROVED'
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-900 shadow-xs'
                          : d.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-xs'
                          : 'bg-rose-950/90 text-rose-300 border border-rose-900'
                      }`}>
                        {d.status === 'APPROVED' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                        {d.status === 'PENDING_APPROVAL' && <ShieldAlert className="w-3 h-3 text-amber-400 animate-pulse" />}
                        {d.status !== 'APPROVED' && d.status !== 'PENDING_APPROVAL' && <ShieldX className="w-3 h-3 text-rose-400" />}
                        <span>{d.status === 'APPROVED' ? 'Approved' : d.status === 'PENDING_APPROVAL' ? 'Pending' : d.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Device Info & Telemetry Box */}
                  <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/60 flex flex-col gap-2">
                    {/* Device Hostname & OS */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Laptop className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-bold text-white text-xs truncate select-all">{meta.hostname || '—'}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 shrink-0">
                        {meta.platform || 'Windows'} ({meta.arch || 'x64'})
                      </span>
                    </div>

                    {/* Network & IP */}
                    <div className="flex items-center justify-between gap-2 text-xs border-t border-stone-800/60 pt-2">
                      <span className="flex items-center gap-1 text-stone-500 text-[10px] uppercase font-bold tracking-wider shrink-0">
                        <Network className="w-3 h-3 text-emerald-400" />
                        <span>IP / Gateway</span>
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-bold text-emerald-400 select-all">{exactIp}</span>
                        {defaultGateway !== '—' && (
                          <span className="text-[10px] text-stone-500 hidden xs:inline select-all">
                            ({defaultGateway})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CPU & Motherboard */}
                    <div className="flex flex-col gap-1 border-t border-stone-800/60 pt-2 text-xs text-stone-300">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-stone-500 text-[10px] uppercase font-bold tracking-wider shrink-0">
                          <Cpu className="w-3 h-3 text-stone-400" />
                          <span>CPU</span>
                        </span>
                        <span className="truncate text-stone-200 text-right max-w-50" title={meta.cpuModel || 'CPU'}>
                          {meta.cpuModel || '—'}
                        </span>
                      </div>
                      {mbSerial !== '—' && (
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider shrink-0">MB Serial</span>
                          <span className="font-mono text-stone-300 select-all truncate max-w-45">{mbSerial}</span>
                        </div>
                      )}
                      {sysUuid !== '—' && (
                        <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500 font-mono">
                          <span className="uppercase font-bold tracking-wider shrink-0">UUID</span>
                          <span className="select-all truncate max-w-45">{sysUuid}</span>
                        </div>
                      )}
                    </div>

                    {/* View JSON Telemetry link */}
                    <div className="flex items-center justify-between border-t border-stone-800/60 pt-2 text-xs">
                      <span className="text-stone-500 text-[10px]">
                        {d.lastConnectedAt
                          ? `Active: ${new Date(d.lastConnectedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                          : `Reg: ${new Date(d.firstSeenAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTelemetryDevice(d)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer underline"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Full JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    {d.status === 'APPROVED' ? (
                      <button
                        onClick={() => handleAdminRevoke(d._id)}
                        disabled={isProcessing}
                        className="btn btn-sm flex-1 sm:flex-initial justify-center bg-stone-900 hover:bg-rose-900/60 text-rose-400 border border-stone-800 hover:border-rose-800 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        Revoke
                      </button>
                    ) : d.status === 'PENDING_APPROVAL' ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleAdminReject(d._id)}
                          disabled={isProcessing}
                          className="btn btn-sm flex-1 justify-center bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800 font-bold px-2.5 py-1.5 rounded-xl text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAdminApprove(d._id)}
                          disabled={isProcessing}
                          className="btn btn-sm flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
                        >
                          Approve PC
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdminApprove(d._id)}
                        disabled={isProcessing}
                        className="btn btn-sm flex-1 sm:flex-initial justify-center bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                      >
                        Re-Approve
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-275">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Shop Details</th>
                <th className="py-3.5 px-4">Device Hostname</th>
                <th className="py-3.5 px-4">Hardware Telemetry (CPU / MB / UUID)</th>
                <th className="py-3.5 px-4">Network & IP Telemetry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <AdminDeviceTableSkeleton rows={6} />
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500 text-sm">
                    No hardware devices match the criteria.
                  </td>
                </tr>
              ) : (
                devices.map((d) => {
                  const shop = d.shopId || {}
                  const meta = d.meta || {}
                  const isProcessing = actionLoadingId === d._id

                  const exactIp = meta.ipAddress || meta.localIp || '—'
                  const defaultGateway = meta.defaultGateway || '—'
                  const mbSerial = meta.motherboardSerial && meta.motherboardSerial !== 'Unknown' ? meta.motherboardSerial : '—'
                  const sysUuid = meta.systemUuid && meta.systemUuid !== '' ? meta.systemUuid : '—'

                  return (
                    <tr key={d._id} className="hover:bg-stone-900/60 transition-colors whitespace-nowrap">

                      {/* 1. Shop Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-white">{shop.shopName || 'Unknown Shop'}</span>
                          <span className="font-mono text-[11px] text-stone-400">{shop.shopCode || '—'}</span>
                          {shop.phone && <span className="text-[11px] text-stone-500">{shop.phone}</span>}
                        </div>
                      </td>

                      {/* 2. Device Hostname */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-stone-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-200">{meta.hostname || '—'}</span>
                            <span className="text-[11px] text-stone-500">{meta.platform || 'Windows'} ({meta.arch || 'x64'})</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Hardware Telemetry (CPU / Motherboard / System UUID) */}
                      <td className="py-3.5 px-4 text-stone-300">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-stone-200">
                            <Cpu className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate max-w-50" title={meta.cpuModel || 'CPU'}>
                              {meta.cpuModel || '—'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                            <span className="text-stone-500">MB Serial:</span>
                            <span className="text-stone-300 select-all">{mbSerial}</span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-500 flex items-center gap-1 truncate max-w-55" title={sysUuid}>
                            <span>UUID:</span>
                            <span className="select-all">{sysUuid !== '—' ? `${sysUuid.slice(0, 18)}...` : '—'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Network & IP Telemetry */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Network className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono font-extrabold text-emerald-400 text-xs select-all">
                              {exactIp}
                            </span>
                          </div>
                          {defaultGateway !== '—' && (
                            <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                              <span className="text-stone-500">Gateway:</span>
                              <span className="text-stone-300 select-all">{defaultGateway}</span>
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedTelemetryDevice(d)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 mt-0.5 cursor-pointer underline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Full JSON Telemetry</span>
                          </button>
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded text-[11px] ${
                          d.status === 'APPROVED'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : d.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}>
                          {d.status === 'APPROVED' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          {d.status === 'PENDING_APPROVAL' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                          {d.status !== 'APPROVED' && d.status !== 'PENDING_APPROVAL' && <ShieldX className="w-3.5 h-3.5 text-rose-400" />}
                          {d.status}
                        </span>
                      </td>

                      {/* 6. Last Activity */}
                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {d.lastConnectedAt
                          ? new Date(d.lastConnectedAt).toLocaleString('en-IN')
                          : `Registered: ${new Date(d.firstSeenAt).toLocaleDateString('en-IN')}`}
                      </td>

                      {/* 7. Super Admin Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.status === 'APPROVED' ? (
                            <button
                              onClick={() => handleAdminRevoke(d._id)}
                              disabled={isProcessing}
                              className="btn btn-xs bg-stone-900 hover:bg-rose-900/60 text-rose-400 border border-stone-800 hover:border-rose-800 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Revoke
                            </button>
                          ) : d.status === 'PENDING_APPROVAL' ? (
                            <>
                              <button
                                onClick={() => handleAdminReject(d._id)}
                                disabled={isProcessing}
                                className="btn btn-xs bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800 font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAdminApprove(d._id)}
                                disabled={isProcessing}
                                className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-xs"
                              >
                                Approve PC
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAdminApprove(d._id)}
                              disabled={isProcessing}
                              className="btn btn-xs bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 sm:mt-4 pt-4 border-t border-stone-800">
            <span className="text-xs text-stone-400 text-center sm:text-left">
              Total <strong className="text-white">{pagination.totalCount}</strong> registered devices
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-stone-300 font-mono px-2">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages || loading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Hardware Telemetry Inspector Modal (Scrollable with max-h-[85vh]) */}
      {selectedTelemetryDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-stone-950 rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-stone-800 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden my-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-heading">
                    Full Hardware & Network Telemetry
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    {selectedTelemetryDevice.shopId?.shopName || 'Shop'} ({selectedTelemetryDevice.shopId?.shopCode || '—'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTelemetryDevice(null)}
                className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer border border-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto pr-1 sm:pr-2 py-4 flex flex-col gap-4 custom-scrollbar">

              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Hostname</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedTelemetryDevice.meta?.hostname || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Operating System</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedTelemetryDevice.meta?.platform || 'Windows'} ({selectedTelemetryDevice.meta?.arch || 'x64'})</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Processor (CPU)</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedTelemetryDevice.meta?.cpuModel || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Motherboard Serial</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono select-all">{selectedTelemetryDevice.meta?.motherboardSerial || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">System UUID</span>
                  <span className="text-xs font-bold text-stone-300 font-mono select-all break-all">{selectedTelemetryDevice.meta?.systemUuid || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Local Physical IPv4</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono select-all">{selectedTelemetryDevice.meta?.ipAddress || selectedTelemetryDevice.meta?.localIp || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Default Gateway</span>
                  <span className="text-sm font-bold text-stone-300 font-mono select-all">{selectedTelemetryDevice.meta?.defaultGateway || '—'}</span>
                </div>

                <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Total System RAM</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedTelemetryDevice.meta?.totalMemoryGb ? `${selectedTelemetryDevice.meta.totalMemoryGb} GB RAM` : '—'}</span>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Exact Live JSON Payload</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify({ ...selectedTelemetryDevice.meta, fingerprint: selectedTelemetryDevice.fingerprint }, null, 2), 'JSON Telemetry')}
                    className="btn btn-xs bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="bg-black/90 p-4 rounded-2xl border border-stone-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all max-h-48 custom-scrollbar">
                  {JSON.stringify(
                    {
                      hostname: selectedTelemetryDevice.meta?.hostname,
                      platform: selectedTelemetryDevice.meta?.platform,
                      cpuModel: selectedTelemetryDevice.meta?.cpuModel,
                      motherboardSerial: selectedTelemetryDevice.meta?.motherboardSerial,
                      systemUuid: selectedTelemetryDevice.meta?.systemUuid,
                      ipAddress: selectedTelemetryDevice.meta?.ipAddress || selectedTelemetryDevice.meta?.localIp,
                      localIp: selectedTelemetryDevice.meta?.localIp || selectedTelemetryDevice.meta?.ipAddress,
                      defaultGateway: selectedTelemetryDevice.meta?.defaultGateway,
                      fingerprint: selectedTelemetryDevice.fingerprint,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-stone-800 shrink-0">
              <button
                onClick={() => setSelectedTelemetryDevice(null)}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2 rounded-xl"
              >
                Close Telemetry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
