import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'

export default function FloatingWhatsApp() {
  const { publicSettings } = useAuthStore()

  const rawPhone = String(publicSettings?.supportPhone || '917073904473').replace(/[^\d]/g, '')
  const waNumber = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
      {/* Floating Action Button */}
      <motion.a
        href={`https://wa.me/${waNumber}?text=Hello%20Scan%26Print%20Support%2C%20I%20need%20assistance%20with%20shop%20setup`}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.6)] transition-shadow cursor-pointer group"
        aria-label="Chat on WhatsApp"
      >
        {/* Ping Ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping pointer-events-none" />
        <span className="absolute inset-4 rounded-full bg-emerald-500 opacity-60 animate-ping pointer-events-none" />
        <span className="absolute inset-8 rounded-full bg-emerald-500 opacity-60 animate-ping pointer-events-none" />

        {/* WhatsApp Icon (Lucide MessageSquare or WhatsApp SVG) */}
        <div className="relative z-10">
          <svg
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-white"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>

        {/* Live Active Online Green Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
      </motion.a>
    </div>
  )
}
