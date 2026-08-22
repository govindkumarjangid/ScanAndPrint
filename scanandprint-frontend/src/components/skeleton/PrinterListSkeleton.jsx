import SkeletonBase from './SkeletonBase'

export default function PrinterListSkeleton({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <SkeletonBase className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <SkeletonBase className="h-4 w-40 sm:w-56 rounded-md" />
              <SkeletonBase className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <SkeletonBase className="h-7 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}
