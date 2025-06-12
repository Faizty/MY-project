"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/context/websocket-context"
import { useAuth } from "@/context/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

// Simple inline ConnectionStatus component to avoid import issues
function ConnectionStatus() {
  const { isConnected, connectionState } = useWebSocket()

  return (
    <div className="mb-4 p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
        <span className="text-xs text-muted-foreground">Status: {connectionState}</span>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const {
    isConnected,
    conversations,
    currentMessages,
    currentConversation,
    typingUsers,
    getConversations,
    getMessages,
    sendMessage,
  } = useWebSocket()
  const [selectedConversation, setSelectedConversation] = useState(null)

  // Load conversations when connected
  useEffect(() => {
    if (isConnected) {
      getConversations()
    }
  }, [isConnected, getConversations])

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    getMessages(conversation.conversationId)
  }

  // Handle sending a message
  const handleSendMessage = (message) => {
    if (!selectedConversation || !message.trim()) return

    console.log("Sending message:", {
      recipientId: selectedConversation.otherParticipantId,
      message: message.trim(),
      productId: selectedConversation.productId,
      productName: selectedConversation.productName,
      recipientName: selectedConversation.otherParticipantName,
    })

    const success = sendMessage(
      selectedConversation.otherParticipantId,
      message.trim(),
      selectedConversation.productId,
      selectedConversation.productName,
      selectedConversation.otherParticipantName,
    )

    if (!success) {
      console.error("Failed to send message")
    }
  }

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <ConnectionStatus />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Conversations List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/30">
            <h2 className="font-semibold">Conversations ({conversations.length})</h2>
          </div>
          <Separator />
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No conversations yet</p>
                {!isConnected && <p className="text-xs mt-2">Connect to see conversations</p>}
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conversationId}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.conversationId === conversation.conversationId ? "bg-muted/70" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{conversation.otherParticipantName?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">{conversation.otherParticipantName}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage.message}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-1">
                          {conversation.productName && (
                            <span className="text-xs text-muted-foreground">Re: {conversation.productName}</span>
                          )}

                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 bg-muted/30 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">{selectedConversation.otherParticipantName}</h2>
                  {selectedConversation.productName && (
                    <p className="text-sm text-muted-foreground">Product: {selectedConversation.productName}</p>
                  )}
                </div>
                <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Online" : "Offline"}</Badge>
              </div>
              <Separator />
              <div className="flex-1 flex flex-col">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      currentMessages.map((message) => {
                        const isMyMessage = String(message.senderId) === String(user?.id)
                        return (
                          <div key={message.id} className="w-full">
                            {isMyMessage ? (
                              <div className="flex justify-end items-end gap-2 mb-4">
                                <div className="max-w-[70%] bg-blue-500 text-white rounded-lg p-3 shadow-sm">
                                  <div className="text-sm">{message.message}</div>
                                  <div className="mt-1 text-xs text-blue-100 flex items-center gap-1">
                                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                    {message.status && (
                                      <span className="ml-1">
                                        {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓" : "○"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-start items-end gap-2 mb-4">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{message.senderName?.charAt(0) || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="max-w-[70%] bg-gray-200 text-gray-900 rounded-lg p-3 shadow-sm">
                                  <div className="text-sm font-medium text-gray-600 mb-1">{message.senderName}</div>
                                  <div className="text-sm">{message.message}</div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      className="min-h-[80px] flex-1 resize-none p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={!isConnected ? "Connecting..." : "Type a message..."}
                      disabled={!isConnected}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          const message = e.target.value.trim()
                          if (message && selectedConversation && isConnected) {
                            handleSendMessage(message)
                            e.target.value = ""
                          }
                        }
                      }}
                    />
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!isConnected}
                      onClick={(e) => {
                        const textarea = e.target.parentElement.querySelector("textarea")
                        const message = textarea.value.trim()
                        if (message && selectedConversation && isConnected) {
                          handleSendMessage(message)
                          textarea.value = ""
                        }
                      }}
                    >
                      Send
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                    {!isConnected && " • Disconnected"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-8">
              <div className="text-center">
                <h3 className="font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
                {!isConnected && <p className="text-sm text-red-500 mt-2">WebSocket disconnected</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
