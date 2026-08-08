import React from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight } from '../../assets/assets'

export default function OriginStoryTeaser() {
  return (
    <section className="px-4 sm:px-6 max-w-300 mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-linear-to-br from-amber-50 to-stone-100 rounded-3xl p-8 sm:p-12 border border-amber-200/70 shadow-sm relative overflow-hidden"
      >
        <img src="/images/main-landing-image.png" alt="Origin Story" className="w-full h-auto rounded-xl" />
      </motion.div>
    </section>
  )
}
