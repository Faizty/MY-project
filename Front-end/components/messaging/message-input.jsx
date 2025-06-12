"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useWebSocket } from "@/context/websocket-context"

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { sendTypingStatus, currentConversation } = useWebSocket()

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Handle typing status
  const handleTypingStart = () => {
    if (!isTyping && currentConversation) {
      setIsTyping(true)
      sendTypingStatus?.(currentConversation, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingStatus?.(currentConversation, false)
    }, 2000)
  }

  const handleTypingStop = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (isTyping) {
      setIsTyping(false)
      sendTypingStatus?.(currentConversation, false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping && currentConversation) {
        sendTypingStatus?.(currentConversation, false)
      }
    }
  }, [isTyping, currentConversation, sendTypingStatus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage("")
    handleTypingStop()
  }

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else {
      handleTypingStart()
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      handleTypingStart()
    } else {
      handleTypingStop()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleTypingStop}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          disabled={disabled}
          className="min-h-[80px] flex-1 resize-none"
        />
        <Button type="submit" size="icon" disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  )
}
