"use client"

import { useState, useRef } from "react"
import Image from "next/image"

export default function ImageZoom({ src, alt, width = 600, height = 600 }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!imageRef.current || !isZoomed) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()

    // Calculate position as percentage
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    // Limit values between 0 and 1
    const boundedX = Math.max(0, Math.min(1, x))
    const boundedY = Math.max(0, Math.min(1, y))

    setPosition({ x: boundedX, y: boundedY })
  }

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed)
  }

  return (
    <div
      className={`product-image-zoom relative overflow-hidden rounded-lg border ${isZoomed ? "zoomed" : ""}`}
      onClick={handleZoomToggle}
      onMouseMove={handleMouseMove}
      ref={imageRef}
    >
      <div className="relative aspect-square">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          style={{
            transformOrigin: isZoomed ? `${position.x * 100}% ${position.y * 100}%` : "center",
            transform: isZoomed ? "scale(2.5)" : "scale(1)",
          }}
        />
      </div>
      {!isZoomed && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs py-1 px-2 rounded-md">
          Click to zoom
        </div>
      )}
    </div>
  )
}
