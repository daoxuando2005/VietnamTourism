import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { reviewService } from '@/services'
import { ROUTES } from '@/routes/paths'
import type { Review } from '@/types'

interface ReviewFormProps {
  destinationId: string
  onReviewSubmitted: (newReview: Review) => void
}

export function ReviewForm({ destinationId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth()
  const location = useLocation()

  // Form fields state
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // UI state
  const [validationError, setValidationError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect prompt if guest user
  if (!user) {
    return (
      <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-5 text-center space-y-3">
        <svg className="mx-auto h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h4 className="text-sm font-bold text-gray-900">Want to write a review?</h4>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Only registered and logged-in travelers can write reviews for destinations.
        </p>
        <div className="pt-2">
          <Link
            to={ROUTES.login}
            state={{ from: location }}
            className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 focus:outline-none"
          >
            Sign In to Review
          </Link>
        </div>
      </div>
    )
  }

  const validate = () => {
    setValidationError('')
    setSubmitError('')

    if (rating === 0) {
      setValidationError('Please select a star rating (1 to 5 stars).')
      return false
    }

    if (!content.trim()) {
      setValidationError('Review content is required.')
      return false
    }

    if (content.trim().length < 10) {
      setValidationError('Review content must be at least 10 characters long.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const newReview = await reviewService.createReview({
        destinationId,
        userId: user.id,
        rating,
        title: title.trim(),
        content: content.trim(),
      })

      // Reset form on success
      setRating(0)
      setTitle('')
      setContent('')
      onReviewSubmitted(newReview)
    } catch (err) {
      const error = err as Error
      setSubmitError(error.message || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2.5">
        Share Your Experience
      </h3>

      {validationError && (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 border border-amber-100 flex gap-2">
          <span className="font-bold">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 flex gap-2">
          <span className="font-bold">❌</span>
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Star Selection */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Your Rating
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => {
              const starValue = idx + 1
              const isActive = (hoverRating || rating) >= starValue

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <svg
                    className={[
                      'h-6 w-6',
                      isActive ? 'text-amber-400 fill-current' : 'text-gray-200',
                    ].join(' ')}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="review-title" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Review Title (Optional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            disabled={isSubmitting}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Breathtaking landscape, friendly guide..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Content Area */}
        <div>
          <label htmlFor="review-content" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Review Description
          </label>
          <textarea
            id="review-content"
            rows={4}
            value={content}
            disabled={isSubmitting}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about your trip: what did you like? What was not so great? Any advice for other travelers?"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-teal-400"
        >
          {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
export default ReviewForm
