import SkeletonBase from './SkeletonBase'

export default function TableSkeleton({
  rows = 5,
  variant = 'light',
  columns = [
    { width: 'w-20', label: 'Job ID' },
    { width: 'w-44', label: 'File Name' },
    { width: 'w-24', label: 'Details' },
    { width: 'w-16', label: 'Type' },
    { width: 'w-14', label: 'Amount' },
    { width: 'w-20', label: 'Status' },
    { width: 'w-16', label: 'Actions' },
  ],
}) {
  const rowBorder =
    variant === 'dark'
      ? 'border-stone-850 md:border-0 divide-stone-800/60 bg-stone-900/30 md:bg-transparent'
      : 'border-stone-200/80 md:border-0 divide-stone-100 bg-stone-50/40 md:bg-transparent'

  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr
          key={rIdx}
          className={`block md:table-row border rounded-2xl md:rounded-none p-4 md:p-0 ${rowBorder}`}
        >
          {columns.map((col, cIdx) => (
            <td
              key={cIdx}
              className="flex justify-between items-center md:table-cell py-2 md:py-3.5 px-0 md:px-4"
            >
              {/* Mobile label preview */}
              <span className="md:hidden text-xs text-stone-400 font-medium">
                {col.label || '—'}
              </span>
              <SkeletonBase
                variant={variant}
                className={`h-4 ${col.width || 'w-24'} rounded-md`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
