import React from 'react'
import SkeletonBase from './SkeletonBase'

/**
 * Skeleton Loader matching Authorized PC & Device Binding card in Shop Owner dashboard
 */
export default function OwnerDeviceSkeleton() {
  return (
    <div className="bg-stone-50/70 rounded-2xl p-4 sm:p-6 border border-stone-200/80 flex flex-col gap-4 sm:gap-5 overflow-hidden animate-pulse">
      {/* Top Details Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <SkeletonBase variant="light" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 bg-stone-200" />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <SkeletonBase variant="light" className="h-5 w-44 rounded-md" />
              <SkeletonBase variant="light" className="h-4 w-14 rounded-lg bg-stone-200" />
            </div>
            <SkeletonBase variant="light" className="h-3.5 w-64 rounded" />
          </div>
        </div>

        <SkeletonBase variant="light" className="h-8 w-28 rounded-xl bg-emerald-100/70" />
      </div>

      {/* Hardware Specifications 4-Box Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/60 flex flex-col gap-1.5 shadow-2xs"
          >
            <SkeletonBase variant="light" className="h-2.5 w-24 rounded" />
            <SkeletonBase variant="light" className="h-3.5 w-32 rounded font-bold" />
          </div>
        ))}
      </div>

      {/* Hardware Key Strip */}
      <div className="bg-white/80 px-3 py-2.5 rounded-xl border border-stone-200/70 flex items-center justify-between gap-2">
        <SkeletonBase variant="light" className="h-3 w-72 rounded font-mono" />
        <SkeletonBase variant="light" className="w-4 h-4 rounded shrink-0" />
      </div>
    </div>
  )
}
