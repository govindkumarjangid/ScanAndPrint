import { motion } from 'framer-motion'
import {
  Star,
  Quote,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Store,
} from '../../assets/assets'

export default function TestimonialCard({ item, onSelect }) {
  if (!item) return null

  return (
    <motion.div
      onClick={() => onSelect && onSelect(item)}
      whileTap={{ scale: 0.99 }}
      className="w-[84vw] max-w-82.5 sm:w-85 shrink-0 bg-white rounded-2xl p-4.5 sm:p-5.5 border border-stone-200 hover:border-amber-400 transition-colors duration-200 flex flex-col justify-between snap-center sm:snap-start relative select-none overflow-hidden cursor-pointer"
    >
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/60 px-2 py-0.5 rounded-full">
            <div className="flex items-center text-amber-400">
              {[...Array(item.rating || 5)].map((_, i) => (
                <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-800">5.0</span>
          </div>

          {item.growth && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>{item.growth}</span>
            </span>
          )}
        </div>

        <div className="relative">
          <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300/30 absolute -top-2.5 -left-1 z-0 pointer-events-none" />
          <p className="text-stone-700 text-xs sm:text-[13.5px] leading-relaxed font-normal relative z-10 pl-1.5 line-clamp-4">
            "{item.feedback}"
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 sm:pt-3.5 sm:mt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-tr ${item.avatarBg || 'from-amber-500 to-rose-500'
                } text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}
            >
              {item.avatar || 'SO'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-brand font-semibold truncate flex items-center gap-1">
              <Store className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{item.shopName}</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-400 flex items-center gap-0.5 truncate">
              <MapPin className="w-2 h-2 text-stone-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          </div>
        </div>

        {/* Volume Badge */}
        {item.stats && (
          <div className="text-right flex flex-col shrink-0">
            <span className="text-[8px] sm:text-[9px] text-stone-400 font-semibold uppercase">Prints</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-800 bg-stone-100 px-1.5 sm:px-2 py-0.5 rounded-md border border-stone-200/80">
              {item.stats.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
