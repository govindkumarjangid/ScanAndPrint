import { Link } from 'react-router'

export const OwnerLogo = () => {
    return (
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white border border-rose-200/80 p-1.5 flex items-center justify-center shadow-md shadow-rose-500/10 group-hover:scale-105 transition-transform duration-200">
                <img src="/svgs/logo.svg" alt="Scan&Print Logo" width="40" height="40" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-stone-900 leading-none">
                    Scan<span className="text-brand">&Print</span>
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                    Owner Dashboard
                </span>
            </div>
        </Link>
    )
}

