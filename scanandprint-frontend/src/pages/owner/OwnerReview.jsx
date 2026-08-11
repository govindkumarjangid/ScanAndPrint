import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, CreditCard, Star } from 'lucide-react'

export default function OwnerReview() {
  const [name, setName] = useState('')
  const [stateName, setStateName] = useState('')
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSaveReview = (e) => {
    e.preventDefault()
    // handle submit
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Give a Review
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-2 bg-stone-50 p-6 rounded-2xl border border-stone-100">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <h2 className="text-base font-extrabold text-stone-900">Give a Review</h2>
          </div>
          <p className="text-stone-500 text-sm font-medium">
            Aapka review QR Se Print ke homepage par dikhega. Bhejne ke baad ek baar check hota hai, phir live ho jaata hai. Kabhi bhi badal sakte ho.
          </p>

          <form onSubmit={handleSaveReview} className="flex flex-col gap-5 mt-4">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rakesh Kumar"
                className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                State
              </label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Jharkhand"
                className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                How many stars?
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setStars(star)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${star <= (hoveredStar || stars)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-200 text-stone-200'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Your Review
              </label>
              <textarea
                required
                rows={4}
                maxLength={1200}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="How was using QR Se Print? What did you like most?"
                className="w-full p-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors resize-none"
              />
              <div className="text-[11px] text-stone-500 font-medium">
                {review.length}/1200 at least 50 characters
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-auto"
              >
                Send Review
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
