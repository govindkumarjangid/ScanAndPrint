import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import SEO from '../components/common/SEO'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <SEO title="404 - Page Not Found | Scan&Print" description="The page you are looking for does not exist." noIndex={true} />
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-rose-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-6"
      >
        <div className="w-24 h-24 bg-rose-950/50 rounded-3xl border border-rose-900/50 flex items-center justify-center shadow-[0_0_50px_rgb(225,29,72,0.15)] mb-2">
          <AlertTriangle className="w-12 h-12 text-brand" />
        </div>

        <div>
          <h1 className="text-7xl font-black text-white font-heading tracking-tighter mb-2">404</h1>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-200 mb-3">Page Not Found</h2>
          <p className="text-stone-400 text-sm font-medium leading-relaxed">
            Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-2xl border border-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
