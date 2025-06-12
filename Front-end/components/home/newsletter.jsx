"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2 } from "lucide-react"

export default function Newsletter() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
      toast({
        title: "Subscribed!",
        description: "You've been added to our newsletter.",
      })
    }, 1000)
  }

  return (
    <div className="bg-primary py-16 dark:bg-gray-800 dark:border-t dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white dark:text-white">Stay Updated with TechTrove</h2>
          <p className="mb-6 text-primary-foreground dark:text-gray-300">
            Subscribe to our newsletter for exclusive deals, new product announcements, and tech tips.
          </p>

          {isSubscribed ? (
            <div className="flex flex-col items-center justify-center">
              <CheckCircle2 className="mb-2 h-12 w-12 text-white dark:text-green-400" />
              <p className="text-white dark:text-gray-200">Thanks for subscribing! Check your inbox soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="whitespace-nowrap dark:bg-brand-600 dark:text-white dark:hover:bg-brand-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent dark:border-white dark:border-t-transparent"></span>
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
