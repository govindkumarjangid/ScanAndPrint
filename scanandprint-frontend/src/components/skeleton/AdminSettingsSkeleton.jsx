import React from 'react'
import SkeletonBase from './SkeletonBase'

/**
 * Skeleton Loader matching the exact layout of Admin System Settings form
 */
export default function AdminSettingsSkeleton() {
  return (
    <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6 shadow-sm animate-pulse">
      
      {/* 1. Subscription Plan Pricing & Discounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-rose-500/40" />
          <SkeletonBase variant="dark" className="h-4 w-64 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Monthly Plan Group Skeleton */}
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SkeletonBase variant="dark" className="h-3.5 w-28 rounded" />
              <SkeletonBase variant="dark" className="h-4 w-16 rounded-md bg-emerald-950/60" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <SkeletonBase variant="dark" className="h-3 w-28 rounded" />
                <SkeletonBase variant="dark" className="h-10 w-full rounded-xl bg-stone-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <SkeletonBase variant="dark" className="h-3 w-24 rounded" />
                <SkeletonBase variant="dark" className="h-10 w-full rounded-xl bg-stone-900" />
              </div>
            </div>
          </div>

          {/* Yearly Plan Group Skeleton */}
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SkeletonBase variant="dark" className="h-3.5 w-36 rounded" />
              <SkeletonBase variant="dark" className="h-4 w-16 rounded-md bg-rose-950/60" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <SkeletonBase variant="dark" className="h-3 w-28 rounded" />
                <SkeletonBase variant="dark" className="h-10 w-full rounded-xl bg-stone-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <SkeletonBase variant="dark" className="h-3 w-24 rounded" />
                <SkeletonBase variant="dark" className="h-10 w-full rounded-xl bg-stone-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Trial & Privacy Storage Policies */}
      <div className="pt-2 border-t border-stone-800/80">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400/40" />
          <SkeletonBase variant="dark" className="h-4 w-56 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <SkeletonBase variant="dark" className="h-3.5 w-44 rounded" />
            <SkeletonBase variant="dark" className="h-11 w-full rounded-2xl bg-stone-900" />
            <SkeletonBase variant="dark" className="h-2.5 w-56 rounded" />
          </div>

          <div className="flex flex-col gap-2">
            <SkeletonBase variant="dark" className="h-3.5 w-48 rounded" />
            <SkeletonBase variant="dark" className="h-11 w-full rounded-2xl bg-stone-900" />
            <SkeletonBase variant="dark" className="h-2.5 w-60 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Platform Support Info */}
      <div className="pt-2 border-t border-stone-800/80">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-400/40" />
          <SkeletonBase variant="dark" className="h-4 w-44 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <SkeletonBase variant="dark" className="h-3.5 w-36 rounded" />
            <SkeletonBase variant="dark" className="h-11 w-full rounded-2xl bg-stone-900" />
          </div>

          <div className="flex flex-col gap-2">
            <SkeletonBase variant="dark" className="h-3.5 w-32 rounded" />
            <SkeletonBase variant="dark" className="h-11 w-full rounded-2xl bg-stone-900" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <SkeletonBase variant="dark" className="h-3.5 w-48 rounded" />
            <SkeletonBase variant="dark" className="h-11 w-full rounded-2xl bg-stone-900" />
          </div>
        </div>
      </div>

      {/* 4. Global Broadcast Notice */}
      <div className="pt-2 border-t border-stone-800/80 flex flex-col gap-2">
        <SkeletonBase variant="dark" className="h-3.5 w-60 rounded" />
        <SkeletonBase variant="dark" className="h-20 w-full rounded-2xl bg-stone-900" />
      </div>

      {/* 5. Toggles & Security Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800/80">
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <SkeletonBase variant="dark" className="h-3.5 w-32 rounded" />
            <SkeletonBase variant="dark" className="h-2.5 w-48 rounded" />
          </div>
          <SkeletonBase variant="dark" className="h-7 w-14 rounded-full bg-stone-800" />
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <SkeletonBase variant="dark" className="h-3.5 w-32 rounded" />
            <SkeletonBase variant="dark" className="h-2.5 w-48 rounded" />
          </div>
          <SkeletonBase variant="dark" className="h-7 w-14 rounded-full bg-stone-800" />
        </div>
      </div>

      {/* 6. Footer Button */}
      <div className="pt-2 border-t border-stone-800/80 flex justify-end">
        <SkeletonBase variant="dark" className="h-11 w-36 rounded-2xl bg-rose-600/30" />
      </div>

    </div>
  )
}
