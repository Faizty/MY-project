"use client"

import { useState, useEffect } from "react"
/* import { getReviewsSummary } from "@/lib/api" */
import RatingsSummary from "@/components/reviews/ratings-summary"
import ReviewList from "@/components/reviews/review-list"
import ReviewForm from "@/components/reviews/review-form"

export default function ProductReviews({ productId }) {
  const [reviewsSummary, setReviewsSummary] = useState({
    average: 0,
    total: 0,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviewsSummary() {
      try {
        const summary = await getReviewsSummary(productId)
        setReviewsSummary(summary)
      } catch (error) {
        console.error("Error fetching reviews summary:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewsSummary()
  }, [productId])

  const handleReviewSubmitted = async () => {
    // Refresh the reviews summary
    try {
      const summary = await getReviewsSummary(productId)
      setReviewsSummary(summary)
    } catch (error) {
      console.error("Error refreshing reviews summary:", error)
    }
  }

  if (loading) {
    return <div className="py-4 text-center text-sm text-gray-500">Loading reviews...</div>
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <RatingsSummary summary={reviewsSummary} />
        <div className="mt-6">
          <ReviewForm productId={productId} productName="This product" onReviewSubmitted={handleReviewSubmitted} />
        </div>
      </div>
      <div className="md:col-span-2">
        <ReviewList productId={productId} summary={reviewsSummary} />
      </div>
    </div>
  )
}
