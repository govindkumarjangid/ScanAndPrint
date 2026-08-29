import React from 'react'
import SkeletonBase from './SkeletonBase'

/**
 * High-fidelity Skeleton Loader for Admin Hardware PC Device Bindings table
 */
export default function AdminDeviceTableSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-stone-800/60 animate-pulse whitespace-nowrap">
          {/* 1. Shop Details */}
          <td className="py-3.5 px-4">
            <div className="flex flex-col gap-1.5">
              <SkeletonBase variant="dark" className="h-3.5 w-32 rounded" />
              <SkeletonBase variant="dark" className="h-3 w-16 rounded font-mono bg-stone-900" />
              <SkeletonBase variant="dark" className="h-2.5 w-24 rounded" />
            </div>
          </td>

          {/* 2. Device Hostname */}
          <td className="py-3.5 px-4">
            <div className="flex items-center gap-2.5">
              <SkeletonBase variant="dark" className="w-8 h-8 rounded-xl shrink-0 bg-stone-900" />
              <div className="flex flex-col gap-1.5">
                <SkeletonBase variant="dark" className="h-3.5 w-28 rounded" />
                <SkeletonBase variant="dark" className="h-2.5 w-20 rounded" />
              </div>
            </div>
          </td>

          {/* 3. Hardware Telemetry (CPU / MB / UUID) */}
          <td className="py-3.5 px-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <SkeletonBase variant="dark" className="w-3.5 h-3.5 rounded shrink-0" />
                <SkeletonBase variant="dark" className="h-3.5 w-36 rounded" />
              </div>
              <SkeletonBase variant="dark" className="h-2.5 w-28 rounded" />
              <SkeletonBase variant="dark" className="h-2.5 w-32 rounded font-mono" />
            </div>
          </td>

          {/* 4. Network & IP Telemetry */}
          <td className="py-3.5 px-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <SkeletonBase variant="dark" className="w-3.5 h-3.5 rounded shrink-0" />
                <SkeletonBase variant="dark" className="h-3.5 w-24 rounded font-mono bg-emerald-950/40" />
              </div>
              <SkeletonBase variant="dark" className="h-2.5 w-20 rounded" />
              <SkeletonBase variant="dark" className="h-2.5 w-28 rounded text-rose-400/40" />
            </div>
          </td>

          {/* 5. Status Badge */}
          <td className="py-3.5 px-4">
            <SkeletonBase variant="dark" className="h-6 w-20 rounded-md" />
          </td>

          {/* 6. Last Activity */}
          <td className="py-3.5 px-4">
            <SkeletonBase variant="dark" className="h-3 w-28 rounded" />
          </td>

          {/* 7. Super Admin Actions */}
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <SkeletonBase variant="dark" className="h-7 w-16 rounded-lg bg-stone-900" />
              <SkeletonBase variant="dark" className="h-7 w-20 rounded-lg bg-emerald-950/50" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
