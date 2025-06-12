"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getProductReviews, markReviewHelpful, getUserAvatar } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Star, ThumbsUp, CheckCircle, MessageSquare } from "lucide-react"

export default function ReviewList({ productId, summary }) {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortOption, setSortOption] = useState("newest")
  const [filters, setFilters] = useState({
    verifiedOnly: false,
  })
  const [userAvatars, setUserAvatars] = useState({})
  const [avatarsLoading, setAvatarsLoading] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const options = {
          sort: sortOption,
          ratingFilter: selectedRating,
          verifiedOnly: filters.verifiedOnly,
        }
        const data = await getProductReviews(productId, options)
        setReviews(data)

        // Fetch user avatars for each review
        if (data.length > 0) {
          setAvatarsLoading(true)
          await fetchUserAvatars(data)
          setAvatarsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId, sortOption, selectedRating, filters, toast])

  const fetchUserAvatars = async (reviewsData) => {
    try {
      // Get unique user IDs from reviews
      const userIds = [...new Set(reviewsData.map((review) => review.userId))]

      console.log("🖼️ Fetching avatars for user IDs:", userIds)

      // Fetch avatars for all users
      const avatarPromises = userIds.map(async (userId) => {
        try {
          console.log(`🖼️ Fetching avatar for user ${userId}`)
          const avatarResponse = await getUserAvatar(userId)

          if (avatarResponse.success && avatarResponse.avatarData) {
            // Convert ArrayBuffer to base64 URL
            const base64 = btoa(
              new Uint8Array(avatarResponse.avatarData).reduce((data, byte) => data + String.fromCharCode(byte), ""),
            )
            const avatarDataUrl = `data:image/jpeg;base64,${base64}`
            console.log(`🖼️ Successfully fetched avatar for user ${userId}`)
            return { userId, avatarUrl: avatarDataUrl, success: true }
          } else {
            console.log(`🖼️ No avatar found for user ${userId}, using placeholder`)
            // Generate placeholder with user's first letter
            const userName = reviewsData.find((r) => r.userId === userId)?.userName || "U"
            // Handle case where userName might be an email
            const displayName = userName.includes("@") ? userName.split("@")[0] : userName
            const firstLetter = displayName.charAt(0).toUpperCase()
            return {
              userId,
              avatarUrl: `/placeholder.svg?height=50&width=50&text=${firstLetter}`,
              success: false,
            }
          }
        } catch (error) {
          console.error(`🖼️ Error fetching avatar for user ${userId}:`, error)
          // Generate placeholder with user's first letter on error
          const userName = reviewsData.find((r) => r.userId === userId)?.userName || "U"
          const displayName = userName.includes("@") ? userName.split("@")[0] : userName
          const firstLetter = displayName.charAt(0).toUpperCase()
          return {
            userId,
            avatarUrl: `/placeholder.svg?height=50&width=50&text=${firstLetter}`,
            success: false,
          }
        }
      })

      const avatarResults = await Promise.all(avatarPromises)

      // Create avatar map
      const avatarMap = {}
      avatarResults.forEach((result) => {
        avatarMap[result.userId] = result.avatarUrl
      })

      console.log("🖼️ Avatar map created:", avatarMap)
      setUserAvatars(avatarMap)
    } catch (error) {
      console.error("🖼️ Error in fetchUserAvatars:", error)
      // Create fallback avatars for all users
      const fallbackAvatars = {}
      reviewsData.forEach((review) => {
        const firstLetter = review.userName.charAt(0).toUpperCase()
        fallbackAvatars[review.userId] = `/placeholder.svg?height=50&width=50&text=${firstLetter}`
      })
      setUserAvatars(fallbackAvatars)
    }
  }

  // Cleanup object URLs when component unmounts or avatars change
  useEffect(() => {
    return () => {
      Object.values(userAvatars).forEach((url) => {
        if (url.startsWith("blob:") || url.startsWith("data:")) {
          // Only revoke blob URLs, not data URLs
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url)
          }
        }
      })
    }
  }, [userAvatars])

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating)
  }

  const handleSortChange = (value) => {
    setSortOption(value)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleHelpfulClick = async (reviewId) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to mark reviews as helpful",
      })
      return
    }

    try {
      await markReviewHelpful(reviewId)
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, helpfulCount: review.helpfulCount + 1 } : review,
        ),
      )
      toast({
        title: "Thank you!",
        description: "You've marked this review as helpful",
      })
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getUserAvatarUrl = (userId, userName) => {
    if (userAvatars[userId]) {
      return userAvatars[userId]
    }
    // Fallback placeholder while loading
    const displayName = userName.includes("@") ? userName.split("@")[0] : userName
    const firstLetter = displayName.charAt(0).toUpperCase()
    return `/placeholder.svg?height=50&width=50&text=${firstLetter}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Customer Reviews</h3>
          <span className="text-sm text-gray-500">({summary.total})</span>
          {avatarsLoading && <span className="text-xs text-gray-400">(Loading avatars...)</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="most_helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 font-medium">Filter Reviews</h4>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium">By Rating</p>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                        selectedRating === rating ? "bg-brand-50 text-brand-700" : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleRatingFilter(rating)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span>{rating} stars</span>
                      </div>
                      <span className="text-xs text-gray-500">({summary.distribution[rating]})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) => handleFilterChange("verifiedOnly", checked)}
                  />
                  <Label htmlFor="verified" className="text-sm font-normal">
                    Verified purchases only
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <h3 className="mb-1 text-lg font-medium">No reviews found</h3>
              <p className="text-gray-500">
                {selectedRating > 0 || filters.verifiedOnly
                  ? "Try adjusting your filters to see more reviews."
                  : "Be the first to review this product!"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                        <Image
                          src={getUserAvatarUrl(review.userId, review.userName) || "/placeholder.svg"}
                          alt={review.userName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const displayName = review.userName.includes("@")
                              ? review.userName.split("@")[0]
                              : review.userName
                            const firstLetter = displayName.charAt(0).toUpperCase()
                            e.target.src = `/placeholder.svg?height=50&width=50&text=${firstLetter}`
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.userName}</p>
                          {review.verified && (
                            <span className="flex items-center text-xs text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div>{renderStars(review.rating)}</div>
                  </div>

                  <h4 className="mb-2 font-medium">{review.title}</h4>
                  <p className="mb-3 text-gray-600">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <button
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
                      onClick={() => handleHelpfulClick(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpfulCount})
                    </button>
                    <span className="text-xs text-gray-500">
                      {review.helpfulCount > 0 &&
                        `${review.helpfulCount} ${review.helpfulCount === 1 ? "person" : "people"} found this helpful`}
                    </span>
                  </div>

                  {review.reply && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex items-start gap-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src="/placeholder.svg?height=32&width=32&text=SP"
                            alt={review.reply.userName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{review.reply.userName}</p>
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-800">
                              {review.reply.userRole === "seller" ? "Seller" : "Admin"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.reply.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.reply.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
