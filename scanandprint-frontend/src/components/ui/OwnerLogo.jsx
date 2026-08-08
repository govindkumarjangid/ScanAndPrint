import { Printer } from 'lucide-react'
import { Link } from 'react-router'

export const OwnerLogo = () => {
    return (
        <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-stone-900 leading-none">
                    Scan <span className="text-brand">&Print</span>
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                    Owner Dashboard
                </span>
            </div>
        </Link>
    )
}
