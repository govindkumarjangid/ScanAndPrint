import SkeletonBase from './SkeletonBase'

export default function MetricCardSkeleton({ count = 4, variant = 'light' }) {
  const cardBg =
    variant === 'dark'
      ? 'bg-stone-950 border border-stone-800'
      : 'bg-white border border-stone-200/80'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${cardBg} p-6 rounded-3xl shadow-xs flex flex-col justify-between gap-5 min-h-[145px]`}
        >
          <div className="flex items-center justify-between">
            <SkeletonBase variant={variant} className="h-3.5 w-24 rounded-md" />
            <SkeletonBase variant={variant} className="w-10 h-10 rounded-2xl" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonBase variant={variant} className="h-8 w-28 rounded-xl" />
            <SkeletonBase variant={variant} className="h-3.5 w-36 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
