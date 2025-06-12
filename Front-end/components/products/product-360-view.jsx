"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { RotateCw } from "lucide-react"

export default function Product360View({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef(null)

  // Ensure we have at least one image
  const imageList = images?.length > 0 ? images : ["/placeholder.svg?height=400&width=400&text=No+Images"]

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - startX

    // Determine direction and change image based on drag distance
    if (Math.abs(deltaX) > 10) {
      const direction = deltaX > 0 ? -1 : 1
      const newIndex = (currentIndex + direction + imageList.length) % imageList.length

      setCurrentIndex(newIndex)
      setStartX(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add and remove event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("mouseleave", handleMouseUp)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [isDragging, startX, currentIndex])

  return (
    <div
      ref={containerRef}
      className="product-360-view relative aspect-square overflow-hidden rounded-lg border"
      onMouseDown={handleMouseDown}
    >
      <div className="relative h-full w-full">
        <Image
          src={imageList[currentIndex] || "/placeholder.svg"}
          alt={`${alt} - 360 view ${currentIndex + 1}`}
          fill
          className="object-contain"
        />
      </div>
      <div className="product-360-view-indicator flex items-center gap-1">
        <RotateCw className="h-3 w-3" />
        <span>Drag to rotate</span>
      </div>
    </div>
  )
}
