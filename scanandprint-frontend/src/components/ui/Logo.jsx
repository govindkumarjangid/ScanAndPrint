import { Printer } from "lucide-react";
import { Link } from "react-router";

export const Logo = () => {
    return (
        <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/20 group-hover:scale-105 transition-transform duration-200">
                <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 leading-none">
                    Scan<span className="text-brand">&Print</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase mt-0.5">
                    Smart Print Network
                </span>
            </div>
        </Link>
    )
}