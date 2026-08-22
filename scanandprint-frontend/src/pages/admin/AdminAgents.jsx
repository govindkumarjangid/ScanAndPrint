import { useState, useEffect } from 'react'
import { CheckCircle2, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useAdminStore } from '../../store/useAdminStore'
import { getSocket } from '../../lib/socket'
import TableSkeleton from '../../components/skeleton/TableSkeleton'

export default function AdminAgents() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { agentsLoading, agentsData, agentsPagination, fetchAgents } = useAdminStore()

  useEffect(() => {
    fetchAgents(currentPage, 10, searchInput, statusFilter)
  }, [fetchAgents, currentPage, statusFilter])

  // Real-time socket sync for live agent IP and connection changes
  useEffect(() => {
    const socket = getSocket()
    socket.emit('JOIN_ADMIN_ROOM')

    const handleLiveAgentStatus = (data) => {
      console.log('📡 [AdminAgents Live Sync]:', data)
      fetchAgents(currentPage, 10, searchInput, statusFilter)
    }

    socket.on('AGENT_STATUS_CHANGE', handleLiveAgentStatus)
    socket.on('ADMIN_LIVE_AGENT_UPDATE', handleLiveAgentStatus)
    socket.on('ADMIN_LIVE_AGENTS_SYNC', handleLiveAgentStatus)
    socket.on('ADMIN_SHOP_UPDATED', handleLiveAgentStatus)

    return () => {
      socket.off('AGENT_STATUS_CHANGE', handleLiveAgentStatus)
      socket.off('ADMIN_LIVE_AGENT_UPDATE', handleLiveAgentStatus)
      socket.off('ADMIN_LIVE_AGENTS_SYNC', handleLiveAgentStatus)
      socket.off('ADMIN_SHOP_UPDATED', handleLiveAgentStatus)
    }
  }, [fetchAgents, currentPage, searchInput, statusFilter])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    fetchAgents(1, 10, searchInput, statusFilter)
  }

  const pagination = agentsPagination || {
    totalCount: agentsData.length,
    currentPage,
    totalPages: Math.ceil(agentsData.length / 10) || 1,
    limit: 10,
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Live Connected Desktop Print Agents
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 font-medium">
            Monitor real-time persistent Socket.io connections from registered shop Windows PCs
          </p>
        </div>

        <button
          onClick={() => fetchAgents(currentPage, 10, searchInput, statusFilter)}
          disabled={agentsLoading}
          className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${agentsLoading ? 'animate-spin text-rose-500' : ''}`} />
          <span>Refresh Agents</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search by shop name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              <option value="ONLINE">🟢 Online Agents</option>
              <option value="OFFLINE">🔴 Offline Agents</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>
        </div>
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
                <th className="py-3.5 px-4 text-right">Live Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {agentsLoading && agentsData.length === 0 ? (
                <TableSkeleton
                  variant="dark"
                  rows={6}
                  columns={[
                    { width: 'w-24', label: 'Socket ID' },
                    { width: 'w-40', label: 'Shop Details' },
                    { width: 'w-24', label: 'IP Address' },
                    { width: 'w-28', label: 'Version / OS' },
                    { width: 'w-32', label: 'Printers' },
                    { width: 'w-20', label: 'Live Status' },
                  ]}
                />
              ) : agentsData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500 text-sm font-medium">
                    No shops match the search/filter criteria.
                  </td>
                </tr>
              ) : (
                agentsData.map((a, idx) => {
                  const socketId = a.socketId || a.rawSocketId || '—'
                  const shopTitle = a.shopId?.shopName || a.shop || 'Unassigned Shop'
                  const shopCode = a.shopId?.shopCode ? ` (${a.shopId.shopCode})` : ''
                  const ip = a.ipAddress && a.ipAddress !== '—' ? a.ipAddress : (a.isOnline ? '127.0.0.1' : '—')
                  const cleanVer = String(a.agentVersion || '1.0.3').replace(/^v+/i, '')
                  const osPlatform = a.osPlatform || a.osArch || 'Windows x64'
                  const isOnline = Boolean(a.isConnected || a.isOnline)
                  const printerList = a.connectedPrinters || a.shopId?.connectedPrinters || []
                  const printersLabel = printerList.length > 0 ? `${printerList.length} Spooler Devices` : 'No Printers Detected'

                  return (
                    <tr key={a._id || a.socketId || idx} className="hover:bg-stone-900/60 transition-colors whitespace-nowrap">
                      <td className="py-4 px-4 font-bold text-white font-mono text-xs truncate max-w-[140px] select-all" title={a.rawSocketId || socketId}>
                        {isOnline ? socketId : '—'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-stone-200">
                        {shopTitle}
                        <span className="text-xs font-mono text-stone-400 block sm:inline">{shopCode}</span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-emerald-400 select-all">{ip}</span>
                          {a.meta?.defaultGateway && (
                            <span className="text-[10px] text-stone-500 flex items-center gap-1">
                              <span>GW:</span>
                              <span className="text-stone-400 select-all">{a.meta.defaultGateway}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-stone-200">
                            <span>v{cleanVer}</span>
                            {a.meta?.hostname && (
                              <>
                                <span className="text-stone-500">•</span>
                                <span className="font-mono text-stone-300">{a.meta.hostname}</span>
                              </>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 truncate max-w-[200px]" title={a.meta?.cpuModel || osPlatform}>
                            {a.meta?.cpuModel || osPlatform}
                          </span>
                          {a.meta?.motherboardSerial && a.meta?.motherboardSerial !== 'Unknown' && (
                            <span className="text-[10px] font-mono text-stone-500 select-all">
                              MB: {a.meta.motherboardSerial}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-300" title={printerList.map(p => p.name || p).join(', ')}>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs ${
                          printerList.length > 0
                            ? 'bg-stone-900 text-stone-200 border border-stone-800'
                            : 'bg-stone-950 text-stone-500 border border-stone-800'
                        }`}>
                          {printersLabel}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                            isOnline
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-900 shadow-xs'
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

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-stone-800">
            <span className="text-xs font-medium text-stone-400">
              Showing page <strong className="text-white">{pagination.currentPage}</strong> of <strong className="text-white">{pagination.totalPages}</strong> ({pagination.totalCount} shops)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage <= 1 || agentsLoading}
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
                disabled={pagination.currentPage >= pagination.totalPages || agentsLoading}
                className="btn btn-sm bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
