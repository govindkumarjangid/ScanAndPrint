import React from 'react'
import { motion } from 'framer-motion'
import { Monitor, CheckCircle2 } from 'lucide-react'

const agents = [
  {
    socketId: 'sock_live_98234_a1',
    shop: 'Sharma Cyber Cafe (SHOP_98234)',
    ip: '103.22.14.88 (Delhi)',
    version: '1.0.0',
    platform: 'win32 (Windows 11)',
    printers: 'Epson L3210, HP LaserJet Pro',
    status: 'Connected',
  },
  {
    socketId: 'sock_live_98233_b2',
    shop: 'Gupta Xerox (SHOP_98233)',
    ip: '49.15.210.12 (Patna)',
    version: '1.0.0',
    platform: 'win32 (Windows 10)',
    printers: 'Canon PIXMA G3010',
    status: 'Connected',
  },
]

export default function AdminAgents() {
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
              {agents.map((a) => (
                <tr key={a.socketId} className="hover:bg-stone-900/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-white font-mono text-xs">{a.socketId}</td>
                  <td className="py-4 px-4 font-semibold text-stone-200">{a.shop}</td>
                  <td className="py-4 px-4 text-xs font-mono text-stone-400">{a.ip}</td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-300">
                    v{a.version} ({a.platform})
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-stone-400">{a.printers}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
