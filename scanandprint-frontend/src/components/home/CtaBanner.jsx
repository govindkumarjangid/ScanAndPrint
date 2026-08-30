import { Link } from 'react-router'
import { ArrowRight } from '../../assets/assets'

export default function CtaBanner() {
  return (
    <section className="px-4 sm:px-6 max-w-300 mx-auto w-full">
      <div className="bg-linear-to-r from-brand to-brand/70 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl leading-tight text-white">
          Automate & <span className="marker-highlight text-stone-900">Upgrade Your Shop</span> Today!
        </h2>
        <p className="text-rose-100 text-base sm:text-lg max-w-xl">
          Setup takes just 2 minutes. Start using your existing printers with zero hardware changes!
        </p>
        <Link to="/register">
          <button
            className="btn btn-lg bg-amber-400! hover:bg-amber-300! text-stone-900! px-9 shadow-lg"
          >
            <span>Register Shop Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </section>
  )
}
