export default function SkeletonBase({ className = '', variant = 'light' }) {
  const bgClass = variant === 'dark' ? 'bg-stone-800/80' : 'bg-stone-200/80'
  return (
    <div
      className={`animate-pulse rounded-md ${bgClass} ${className}`}
      aria-hidden="true"
    />
  )
}
