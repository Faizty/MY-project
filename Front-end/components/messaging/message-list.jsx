"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, CheckCheck } from "lucide-react"
import TypingIndicator from "@/components/messaging/typing-indicator"

export default function MessageList({ messages = [], typingUsers = [] }) {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, typingUsers])

  // Format timestamp to relative time
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  // Get message status icon
  const getMessageStatusIcon = (message) => {
    if (message.senderId !== user?.id) return null // Only show status for sent messages

    switch (message.status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Check className="h-3 w-3 text-gray-300" />
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          // Check if this message is sent by the current user
          const isMyMessage = String(message.senderId) === String(user?.id)

          console.log("Message alignment check:", {
            messageId: message.id,
            messageSenderId: message.senderId,
            currentUserId: user?.id,
            isMyMessage,
            senderName: message.senderName,
          })

          return (
            <div key={message.id} className="w-full">
              {isMyMessage ? (
                // MY MESSAGES - RIGHT SIDE (Blue bubbles)
                <div className="flex justify-end items-end gap-2 mb-4">
                  <div className="max-w-[70%] bg-blue-500 text-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm">{message.message}</div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-xs text-blue-100">
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">{user?.name?.charAt(0) || "M"}</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                // RECEIVED MESSAGES - LEFT SIDE (Gray bubbles)
                <div className="flex justify-start items-end gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-500 text-white">
                      {message.senderName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%] bg-gray-200 text-gray-900 rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-600 mb-1 font-medium">{message.senderName}</div>
                    <div className="text-sm">{message.message}</div>
                    <div className="mt-1 text-xs text-gray-500">{formatMessageTime(message.timestamp)}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Typing Indicator - Always on left side */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="flex justify-start items-end gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-500 text-white">
                {typingUsers[0]?.userName?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[70%] bg-gray-100 rounded-lg p-3">
              <TypingIndicator users={typingUsers} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
