"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addReview } from "@/lib/api"
import { Star, Loader2 } from "lucide-react"

export default function ReviewForm({ productId, productName, onReviewSubmitted }) {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingClick = (value) => {
    setRating(value)
  }

  const handleRatingHover = (value) => {
    setHoverRating(value)
  }

  const handleRatingLeave = () => {
    setHoverRating(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        productId,
        title,
        comment,
        rating,
        // Remove userId, userName, userAvatar since the API will get these from the token
      }

      await addReview(reviewData)

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h3 className="mb-2 text-lg font-medium">Write a Review</h3>
        <p className="mb-4 text-gray-600">Please log in to share your experience with this product.</p>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6">
      <h3 className="mb-4 text-lg font-medium">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <div className="flex items-center gap-1" onMouseLeave={handleRatingLeave}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="p-1"
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => handleRatingHover(value)}
              >
                <Star
                  className={`h-6 w-6 ${
                    (hoverRating || rating) >= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1] : "Select a rating"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Review Title</Label>
          <Input
            id="title"
            placeholder="Summarize your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            placeholder={`What did you like or dislike about ${productName}?`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-32"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  )
}
