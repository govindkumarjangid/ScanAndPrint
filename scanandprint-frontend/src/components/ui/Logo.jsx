import { Link } from "react-router";

export const Logo = () => {
    return (
        <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/svgs/logo.svg" alt="Scan&Print Logo" width="32" height="32" className="sm:w-8 sm:h-8 h-6 w-6 object-contain" />
            <div className="flex flex-col">
                <span className="font-extrabold text-md sm:text-xl tracking-tight text-stone-600 leading-none">
                    Scan<span className="text-brand">&Print</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase mt-0.5">
                    Smart Print Network
                </span>
            </div>
        </Link>
    )
}