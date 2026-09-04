
/**
 * Passport Photo Grid Controls & Preset Selector
 * Standard Indian Passport Photo Size: 35mm x 45mm
 */
export default function KioskPassportTab({ passportCount, setPassportCount, photoRates = {} }) {
  const PRESET_COUNTS = [16, 24, 36, 48]

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      {/* Preset Buttons for Passport Copies (16, 24, 36, 48) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Number of Passport Copies
          </label>
          <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
            35 × 45 mm Standard
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COUNTS.map((count) => {
            const isSelected = passportCount === count
            const isMultiPage = count > 30
            const rateEntry = photoRates?.[`p${count}`]
            const price = typeof rateEntry === 'object' && rateEntry !== null
              ? (rateEntry.colorRate || rateEntry.bwRate)
              : rateEntry

            return (
              <button
                key={count}
                type="button"
                onClick={() => setPassportCount(count)}
                className={`py-2 px-1 rounded-xl border text-center font-extrabold text-xs cursor-pointer transition-all shadow-2xs flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-purple-600 border-purple-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="text-sm font-black">{count}</span>
                {Number(price) > 0 && (
                  <span className={`text-[10px] font-black ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                    ₹{price}
                  </span>
                )}
                <span
                  className={`text-[9px] font-bold ${
                    isSelected ? 'text-purple-200' : isMultiPage ? 'text-amber-600 font-extrabold' : 'text-stone-400'
                  }`}
                >
                  {isMultiPage ? '2 Pages' : '1 Page'}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-stone-500 font-medium leading-relaxed mt-1">
          Exact standard passport sizing (35 × 45 mm) with cutting margins. Top-down fill across A4 sheets.
        </p>
      </div>
    </div>
  )
}
