import SkeletonBase from './SkeletonBase'

export default function ChartSkeleton() {
  return (
    <div className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-850 pb-5">
        <div className="flex flex-col gap-2">
          <SkeletonBase variant="dark" className="h-5 w-48 rounded-md" />
          <SkeletonBase variant="dark" className="h-3.5 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBase variant="dark" className="h-8 w-20 rounded-xl" />
          <SkeletonBase variant="dark" className="h-8 w-20 rounded-xl" />
        </div>
      </div>
      <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 pt-8 px-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const heights = ['h-24', 'h-40', 'h-32', 'h-52', 'h-44', 'h-60', 'h-36', 'h-48', 'h-56', 'h-32', 'h-44', 'h-64']
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <SkeletonBase
                variant="dark"
                className={`w-full max-w-[28px] ${heights[i % heights.length]} rounded-t-lg opacity-60`}
              />
              <SkeletonBase variant="dark" className="h-3 w-6 rounded-xs" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
