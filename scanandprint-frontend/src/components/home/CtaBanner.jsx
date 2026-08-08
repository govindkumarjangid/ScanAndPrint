import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from '../../assets/assets'

export default function CtaBanner() {
  return (
    <section className="px-4 sm:px-6 max-w-300 mx-auto w-full">
      <div className="bg-linear-to-r from-brand to-brand/70 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl leading-tight">
          Automate & Upgrade Your Shop Today!
        </h2>
        <p className="text-rose-100 text-base sm:text-lg max-w-xl">
          Setup takes just 2 minutes. Start using your existing printers with zero hardware changes!
        </p>
        <Link to="/register">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="bg-amber-400 hover:bg-amber-300 text-stone-900 px-9 py-4 rounded-full font-extrabold text-lg shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span>Register Shop Now</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </section>
  )
}
