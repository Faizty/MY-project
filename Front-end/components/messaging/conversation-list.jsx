"use client"
import { useWebSocket } from "@/context/websocket-context"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ConversationList({ onSelectConversation }) {
  const { conversations, currentConversation } = useWebSocket()

  // Format timestamp to relative time
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  // Check if user is online (mock function - you can implement real online status)
  const isUserOnline = (userId) => {
    // This would typically check against a real online status system
    return Math.random() > 0.5 // Mock online status
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>No conversations yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <button
            key={conversation.conversationId}
            className={`w-full p-3 text-left hover:bg-muted/50 ${
              currentConversation === conversation.conversationId ? "bg-muted/50" : ""
            } relative`}
            onClick={() => onSelectConversation(conversation.conversationId)}
          >
            <div className="flex items-start">
              <div className="relative">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>{conversation.otherParticipantName?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                {/* Online status indicator */}
                {isUserOnline(conversation.otherParticipantId) && (
                  <div className="absolute -bottom-0 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{conversation.otherParticipantName || "Unknown User"}</div>
                  <div className="text-xs text-muted-foreground ml-2">
                    {conversation.lastMessage ? formatMessageTime(conversation.lastMessage.timestamp) : "No messages"}
                  </div>
                </div>

                {/* Online/Last seen status */}
                <div className="text-xs text-muted-foreground mt-1">
                  {isUserOnline(conversation.otherParticipantId) ? (
                    <span className="text-green-600 font-medium">Online</span>
                  ) : (
                    <span>Last seen {formatMessageTime(conversation.lastActivity || Date.now())}</span>
                  )}
                </div>

                {/* Product information */}
                {conversation.productName && (
                  <div className="text-xs text-blue-600 truncate mt-1">About: {conversation.productName}</div>
                )}

                {/* Last message */}
                <div className="text-sm truncate mt-1">
                  {conversation.lastMessage ? conversation.lastMessage.message : ""}
                </div>

                {/* Unread count - positioned at the bottom */}
                {conversation.unreadCount > 0 && (
                  <div className="mt-2">
                    <Badge className="bg-primary text-primary-foreground text-xs">{conversation.unreadCount} new</Badge>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
