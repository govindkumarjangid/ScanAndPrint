import { Link } from 'react-router'
import { ShieldCheck } from 'lucide-react'

export const AdminLogo = () => {
  return (
    <Link to="/admin/dashboard" className="flex items-center gap-3 group cursor-pointer">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-stone-700/60 group-hover:scale-105 transition-transform duration-200">
          <img src="/svgs/logo.svg" alt="Scan&Print Logo" width="40" height="40" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-2.5 h-2.5" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-lg tracking-tight text-white leading-none">
          Scan<span className="text-brand">&Print</span>
        </span>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
          Super Admin Panel
        </span>
      </div>
    </Link>
  )
}

export default AdminLogo