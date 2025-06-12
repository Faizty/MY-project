"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
      title: "Samsung Galaxy S25",
      subtitle: "Experience the future of mobile technology",
      cta: "Shop Now",
      link: "/products",
    },
    {
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2070&auto=format&fit=crop",
      title: "iPhone 16 Pro",
      subtitle: "Innovation at your fingertips",
      cta: "Explore",
      link: "/products?category=new",
    },
    {
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      title: "MacBook Pro M4",
      subtitle: "Power meets performance",
      cta: "View Deals",
      link: "/products?sale=true",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl shadow-lg mb-12 dark:shadow-gray-900/50">
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full w-full">
              <Image
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Light overlay for text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="mb-2 text-4xl font-bold md:text-5xl lg:text-6xl drop-shadow-lg">{slide.title}</h1>
                <p className="mb-6 max-w-md text-lg md:text-xl drop-shadow-md">{slide.subtitle}</p>
                <Link href={slide.link}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        onClick={goToPrevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-8 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
      </div>
    </div>
  )
}
