"use client"

import { useEffect, useState } from "react"

export default function TypingIndicator({ users = [] }) {
  const [dots, setDots] = useState(".")

  // Animate the dots
  useEffect(() => {
    if (users.length === 0) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "."
        if (prev === "..") return "..."
        if (prev === ".") return ".."
        return "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [users.length])

  if (users.length === 0) return null

  let message = ""
  if (users.length === 1) {
    message = `${users[0].userName || "Someone"} is typing${dots}`
  } else if (users.length === 2) {
    message = `${users[0].userName || "Someone"} and ${users[1].userName || "someone"} are typing${dots}`
  } else {
    message = `${users.length} people are typing${dots}`
  }

  return <div className="text-sm text-muted-foreground animate-pulse">{message}</div>
}
