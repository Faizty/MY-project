"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Tech Enthusiast",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1887&auto=format&fit=crop",
      content:
        "TechTrove has completely changed how I shop for electronics. The quality of products and customer service is unmatched. I've recommended it to all my friends!",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Software Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
      content:
        "As someone who needs reliable tech for work, I appreciate the curated selection and detailed product information. The shipping is always fast and the prices are competitive.",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Digital Creator",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1770&auto=format&fit=crop",
      content:
        "I've purchased camera equipment and accessories multiple times from TechTrove. The quality is always excellent and their customer support team is incredibly helpful.",
      rating: 4,
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Gaming Enthusiast",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1770&auto=format&fit=crop",
      content:
        "The gaming laptops and accessories I've bought here have exceeded my expectations. The detailed specs and honest reviews helped me make the right choice.",
      rating: 5,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
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

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 dark:text-white">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their shopping experience.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={goToPrev}
              className="rounded-full bg-white dark:bg-gray-700 p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="flex-shrink-0 w-full dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            fill
                            className="object-cover dark:brightness-90"
                          />
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <Quote className="h-8 w-8 text-brand-100 dark:text-brand-800 mb-2 mx-auto md:mx-0" />
                        <p className="text-gray-700 dark:text-gray-300 mb-4 italic">{testimonial.content}</p>

                        <div className="mt-4">
                          <div className="mb-2">{renderStars(testimonial.rating)}</div>
                          <h4 className="font-semibold dark:text-white">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={goToNext}
              className="rounded-full bg-white dark:bg-gray-700 p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-brand-600 dark:bg-brand-500" : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
