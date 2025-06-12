"use client"

import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function RatingsSummary({ summary }) {
  const { average, total, distribution } = summary

  // Calculate percentages for the progress bars
  const getPercentage = (count) => {
    return total > 0 ? (count / total) * 100 : 0
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <h3 className="mb-2 text-2xl font-medium">{average.toFixed(1)}</h3>
        <div className="mb-1 flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${star <= Math.round(average) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">Based on {total} reviews</p>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <div className="flex w-12 items-center justify-end gap-1">
              <span className="text-sm">{rating}</span>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
            <Progress value={getPercentage(distribution[rating])} className="h-2 flex-1" />
            <div className="w-10 text-right text-sm text-gray-500">{distribution[rating]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
