import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Star, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerReview() {
  const { currentShop, submitReview, isSubmittingReview } = useAuthStore()

  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewData, setReviewData] = useState({
    username: currentShop?.ownerName || '',
    state: currentShop?.cityState || '',
    stars: 5,
    review: ''
  })

  useEffect(() => {
    if (currentShop) {
      setReviewData(prev => ({
        ...prev,
        username: prev.username || currentShop.ownerName || '',
        state: prev.state || currentShop.cityState || '',
      }))
    }
  }, [currentShop])

  const handleChange = (e) => {
    const { name, value } = e.target
    setReviewData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSaveReview = async (e) => {
    e.preventDefault()
    if (!reviewData.stars) {
      toast.error('Please select a star rating')
      return
    }
    if (reviewData.review.trim().length < 10) {
      toast.error('Please write at least a short review message')
      return
    }

    const success = await submitReview(reviewData)
    if (success) {
      setReviewData(prev => ({ ...prev, review: '', stars: 5 }))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Give a Review
        </h1>
        <p className="text-stone-500 text-sm mt-0.5 font-medium">
          Share your experience with QR PrintPe and help us improve
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-2 bg-stone-50 p-6 rounded-2xl border border-stone-100">
          <p className="text-stone-500 text-sm font-medium">
            Your feedback is valuable to us! Please take a moment to share your experience with ScanAndPrint. Your review will help us improve our services and assist other users in making informed decisions.
          </p>

          <form onSubmit={handleSaveReview} className="flex flex-col gap-5 mt-4">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Your Name
              </label>
              <input
                type="text"
                name="username"
                required
                value={reviewData.username}
                onChange={handleChange}
                placeholder="e.g. Govind Kumar"
                className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={reviewData.state}
                onChange={handleChange}
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
                    onClick={() => setReviewData(prev => ({ ...prev, stars: star }))}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${star <= (hoveredStar || reviewData.stars)
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
                rows={4}
                maxLength={1200}
                name="review"
                required
                value={reviewData.review}
                onChange={handleChange}
                placeholder="How was using ScanAndPrint? What did you like most?"
                className="w-full p-4 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand transition-colors resize-none"
              />
              <div className="text-[11px] text-stone-500 font-medium">
                {reviewData.review.length}/1200 characters
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="btn btn-primary w-auto flex items-center gap-2 px-8"
              >
                {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSubmittingReview ? 'Sending Feedback...' : 'Send Review'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

