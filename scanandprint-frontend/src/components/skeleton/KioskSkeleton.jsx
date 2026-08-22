import SkeletonBase from './SkeletonBase'

export default function KioskSkeleton() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between font-sans">
      {/* Sticky Header Skeleton */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <SkeletonBase className="w-11 h-11 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <SkeletonBase className="h-4 w-32 rounded-md" />
                <SkeletonBase className="h-4 w-12 rounded-md" />
              </div>
              <SkeletonBase className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <SkeletonBase className="h-7 w-24 rounded-full shrink-0" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* 4-Step Stepper Skeleton */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
              <SkeletonBase className="w-7 h-7 rounded-full" />
              <SkeletonBase className="h-2.5 w-12 rounded-xs" />
            </div>
          ))}
        </div>

        {/* Upload Card Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <SkeletonBase className="h-6 w-48 rounded-md" />
            <SkeletonBase className="h-3.5 w-64 rounded-md" />
          </div>

          {/* Upload Dropzone Box Skeleton */}
          <div className="h-48 sm:h-56 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3 p-6 bg-stone-50/50">
            <SkeletonBase className="w-14 h-14 rounded-2xl" />
            <SkeletonBase className="h-4 w-40 rounded-md" />
            <SkeletonBase className="h-3 w-56 rounded-md" />
          </div>

          {/* Action button skeleton */}
          <SkeletonBase className="h-12 w-full rounded-2xl" />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs font-semibold text-stone-400 py-4 flex items-center justify-center gap-2">
        <SkeletonBase className="h-3 w-32 rounded-md" />
      </footer>
    </div>
  )
}
