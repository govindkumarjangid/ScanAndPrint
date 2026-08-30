import { useState, useEffect } from 'react'
import {
  Laptop,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  Info,
  Loader2,
  Headphones,
  Check,
} from 'lucide-react'
import api from '../../lib/axios'
import { getSocket } from '../../lib/socket'
import OwnerDeviceSkeleton from '../../components/skeleton/OwnerDeviceSkeleton'
import toast from 'react-hot-toast'

export default function OwnerDevices() {
  const [loading, setLoading] = useState(true)
  const [approvedDevice, setApprovedDevice] = useState(null)
  const [pendingDevices, setPendingDevices] = useState([])
  const [historyDevices, setHistoryDevices] = useState([])

  const fetchDevices = async (showToast = false) => {
    try {
      setLoading(true)
      const res = await api.get('/devices/my-devices')
      if (res.data.success && res.data.data) {
        const d = res.data.data
        setApprovedDevice(d.approvedDevice || null)
        setPendingDevices(d.pendingDevices || [])
        setHistoryDevices(d.historyDevices || [])
        if (showToast) {
          toast.success('Device status refreshed!')
        }
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err)
      toast.error('Could not load device binding data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) fetchDevices()
    }, 0)

    // Real-time socket sync when Super Admin approves/rejects or new device connects
    const socket = getSocket()
    const handleStatusSync = (data) => {
      if (data?.status === 'APPROVED') {
        toast.success('🎉 Your PC has been APPROVED by Super Admin! Print Agent is now live.')
      } else if (data?.status === 'REJECTED') {
        toast.error('⚠️ Device binding was rejected by Super Admin.')
      }
      fetchDevices()
    }

    socket.on('NEW_DEVICE_PENDING_APPROVAL', handleStatusSync)
    socket.on('DEVICE_STATUS_CHANGED', handleStatusSync)

    return () => {
      isMounted = false
      clearTimeout(timer)
      socket.off('NEW_DEVICE_PENDING_APPROVAL', handleStatusSync)
      socket.off('DEVICE_STATUS_CHANGED', handleStatusSync)
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading flex items-center gap-2.5">
            <span>Authorized PC & Device Binding</span>
          </h1>
          <p className="text-stone-500 text-sm mt-0.5 font-medium">
            Strict hardware device binding prevents unauthorized credential sharing and secures your print shop
          </p>
        </div>

        <button
          onClick={() => fetchDevices(true)}
          disabled={loading}
          className="btn btn-sm bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 shadow-2xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand' : ''}`} />
          <span>Check Approval Status</span>
        </button>
      </div>

      {/* Security Guarantee Banner */}
      <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80 flex items-start gap-3 text-xs text-stone-600 overflow-hidden">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="font-extrabold text-stone-800 uppercase tracking-wider text-[11px]">
            Super Admin Device Verification Policy
          </span>
          <p className="leading-relaxed text-xs">
            Har shop ke credentials sirf <strong>1 Approved Physical PC</strong> par chal sakte hain. Jab bhi aap naya PC connect karenge, wo Super Admin verification ke liye submit hoga. Admin ke approve karne ke baad aapka print agent automatically connect ho jayega.
          </p>
        </div>
      </div>

      {/* 1. PENDING ADMIN APPROVAL (If any device is waiting for Super Admin) */}
      {pendingDevices.length > 0 && (
        <div className="bg-amber-50/90 rounded-3xl p-4 sm:p-6 border-2 border-amber-300 shadow-sm flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base sm:text-lg font-heading">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 animate-pulse shrink-0" />
              <span>Pending Super Admin Approval ({pendingDevices.length} Device)</span>
            </div>
            <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              Under Admin Review
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingDevices.map((p) => {
              const meta = p.meta || {}

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-base font-heading truncate">
                          {meta.hostname || 'Windows PC'}
                        </span>
                        <span className="bg-stone-100 text-stone-600 text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-stone-200 shrink-0">
                          {meta.platform || 'Windows'} ({meta.arch || 'x64'})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
                        <span className="flex items-center gap-1.5 truncate">
                          <Cpu className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{meta.cpuModel || 'CPU'}</span>
                        </span>
                        {meta.totalMemoryGb > 0 && (
                          <span className="flex items-center gap-1.5 shrink-0">
                            <HardDrive className="w-3.5 h-3.5 text-stone-400" />
                            <span>{meta.totalMemoryGb} GB RAM</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Requested: {new Date(p.firstSeenAt).toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono mt-1 select-all break-all">
                        Fingerprint: {p.fingerprint?.slice(0, 16)}...{p.fingerprint?.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 bg-amber-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium shrink-0">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Awaiting Super Admin Approval. Realtime sync is active.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. CURRENT ACTIVE APPROVED DEVICE CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5 sm:gap-6 overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 font-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Current Active Authorized PC</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              The physical computer authorized by Super Admin to process automated prints for your shop
            </p>
          </div>

          {approvedDevice && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Approved Active Binding
            </span>
          )}
        </div>

        {loading ? (
          <OwnerDeviceSkeleton />
        ) : approvedDevice ? (
          <div className="bg-emerald-50/40 rounded-2xl p-4 sm:p-6 border border-emerald-200/80 flex flex-col gap-4 sm:gap-5 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Laptop className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900 font-heading truncate">
                      {approvedDevice.meta?.hostname || 'Authorized Windows PC'}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                      v{approvedDevice.meta?.appVersion || '1.0.3'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mt-1 leading-relaxed">
                    Verified & Authorized by <strong>Super Admin</strong> on: {new Date(approvedDevice.approvedAt || approvedDevice.firstSeenAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized</span>
              </span>
            </div>

            {/* Hardware Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-100/90 flex flex-col gap-1 shadow-2xs min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Processor (CPU)</span>
                <span className="text-xs font-bold text-stone-800 truncate" title={approvedDevice.meta?.cpuModel}>
                  {approvedDevice.meta?.cpuModel || 'Intel / AMD'}
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-100/90 flex flex-col gap-1 shadow-2xs min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Operating System</span>
                <span className="text-xs font-bold text-stone-800 truncate">
                  {approvedDevice.meta?.platform || 'Windows'} ({approvedDevice.meta?.arch || 'x64'})
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-100/90 flex flex-col gap-1 shadow-2xs min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">System Memory</span>
                <span className="text-xs font-bold text-stone-800">
                  {approvedDevice.meta?.totalMemoryGb ? `${approvedDevice.meta.totalMemoryGb} GB RAM` : 'Standard'}
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-100/90 flex flex-col gap-1 shadow-2xs min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Last Active Connect</span>
                <span className="text-xs font-bold text-stone-800 truncate">
                  {approvedDevice.lastConnectedAt ? new Date(approvedDevice.lastConnectedAt).toLocaleTimeString('en-IN') : 'Live'}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-800/80 bg-white/70 px-3 py-2 rounded-xl border border-emerald-100 flex items-center justify-between gap-2 select-all overflow-hidden">
              <span className="truncate">Hardware Key: {approvedDevice.fingerprint}</span>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-8 border border-dashed border-stone-300 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-200/80 flex items-center justify-center text-stone-500">
              <Laptop className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-800 text-base font-heading">No Approved PC Linked Yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-medium">
                Apne shop counter PC par Desktop Print Agent open karein, Shop ID aur Secret Key daalkar Connect karein. Connection request Super Admin ko verification ke liye jayegi aur approve hote hi live ho jayega.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. DEVICE BINDING HISTORY (Revoked / Rejected) */}
      {historyDevices.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 font-heading">
                Previous Device History ({historyDevices.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Computers that were previously unlinked, replaced, or rejected by Admin
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Device Hostname</th>
                  <th className="py-3 px-3">Platform / CPU</th>
                  <th className="py-3 px-3">First Seen</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {historyDevices.map((d) => (
                  <tr key={d._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-stone-800">
                      {d.meta?.hostname || 'Unknown PC'}
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {d.meta?.platform} • {d.meta?.cpuModel || 'CPU'}
                    </td>
                    <td className="py-3.5 px-3 text-stone-500">
                      {new Date(d.firstSeenAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        d.status === 'REVOKED'
                          ? 'bg-stone-100 text-stone-600 border border-stone-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {d.status === 'REVOKED' ? <ShieldX className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Need Help / Contact Admin Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-stone-900 font-heading">Need to change your shop counter PC urgently?</h4>
            <p className="text-[11px] text-stone-500">Contact Scan&Print Support/Super Admin to expedite approval of your new machine.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
