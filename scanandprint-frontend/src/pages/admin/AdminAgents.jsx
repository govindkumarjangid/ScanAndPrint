import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, CheckCircle2, Loader2 } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminAgents() {
  const { agentsLoading, agentsData, fetchAgents } = useAdminStore()

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Live Connected Desktop Print Agents
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Monitor real-time persistent Socket.io connections from shop Windows PCs
        </p>
      </div>

      {/* Agents Table */}
      <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Socket ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">IP Location</th>
                <th className="py-3.5 px-4">Version & OS</th>
                <th className="py-3.5 px-4">Mapped Printers</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {agentsLoading ? (
                <tr>
                  <td colSpan="6" className="py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                      <span className="font-semibold text-xs text-stone-400">Loading active print agents from database...</span>
                    </div>
                  </td>
                </tr>
              ) : agentsData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500 text-sm font-medium">
                    No Desktop Print Agents connected yet. Launch the print agent software to connect.
                  </td>
                </tr>
              ) : (
                agentsData.map((a, idx) => {
                  const socketId = a.socketId || `SOCKET_${idx + 1}`
                  const shopTitle = a.shopId?.shopName || a.shop || 'Unassigned Shop'
                  const shopCode = a.shopId?.shopCode ? ` (${a.shopId.shopCode})` : ''
                  const ip = a.ipAddress || a.ip || '127.0.0.1 (Localhost)'
                  const ver = a.agentVersion || a.version || '1.0.0'
                  const os = a.osPlatform || a.platform || 'win32'
                  const isOnline = a.isConnected ?? true
                  const printerCount = a.shopId?.connectedPrinters?.length
                  const printersLabel = printerCount ? `${printerCount} Spooler Devices` : (a.printers || 'System Default')

                  return (
                    <tr key={a._id || a.socketId || idx} className="hover:bg-stone-900/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs truncate max-w-[140px] select-all">{socketId}</td>
                      <td className="py-4 px-4 font-semibold text-stone-200">
                        {shopTitle}
                        <span className="text-xs font-mono text-stone-400">{shopCode}</span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-stone-400">{ip}</td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-300">
                        v{ver} ({os})
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-400">{printersLabel}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                            isOnline
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-900'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'}`} />
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
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
