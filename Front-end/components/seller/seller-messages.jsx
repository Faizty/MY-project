"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { useWebSocket } from "@/context/websocket-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Send, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function SellerMessages() {
  const { user } = useAuth()
  const {
    isConnected,
    isConnecting,
    conversations,
    messages,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    reconnect,
  } = useWebSocket()
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  // Enhanced debugging effect
  useEffect(() => {
    console.log("[SellerMessages] Component state update:", {
      user: user ? { id: user.id, role: user.role, name: user.name } : null,
      isConnected,
      isConnecting,
      conversations: conversations.length,
      connectionAttempts,
    })

    // Auto-reconnect logic for sellers
    if (user && user.role === "seller" && !isConnected && !isConnecting) {
      const attempts = connectionAttempts + 1
      setConnectionAttempts(attempts)

      if (attempts <= 3) {
        console.log(`[SellerMessages] Auto-reconnect attempt ${attempts} for seller ${user.id}`)
        setTimeout(() => {
          reconnect()
        }, 2000 * attempts) // Increasing delay
      }
    }
  }, [user, isConnected, isConnecting, reconnect, connectionAttempts, conversations.length])

  // Reset connection attempts when connected
  useEffect(() => {
    if (isConnected) {
      setConnectionAttempts(0)
    }
  }, [isConnected])

  // Set loading state based on connection and conversations
  useEffect(() => {
    if (isConnected) {
      setIsLoading(false)
    } else if (!isConnecting) {
      setIsLoading(false) // Show connection error instead of loading
    }
  }, [isConnected, isConnecting])

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation && isConnected) {
      loadMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
    }
  }, [selectedConversation, isConnected, loadMessages, markMessagesAsRead])

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim() || !isConnected) return

    setIsSending(true)
    const conversation = conversations.find((c) => c.conversationId === selectedConversation)

    if (!conversation) {
      toast({
        title: "Error",
        description: "Conversation not found.",
        variant: "destructive",
      })
      setIsSending(false)
      return
    }

    try {
      console.log("[SellerMessages] Sending reply:", {
        conversationId: selectedConversation,
        recipientId: conversation.otherParticipantId,
        recipientName: conversation.otherParticipantName,
        productId: conversation.productId,
        productName: conversation.productName,
        message: replyText,
      })

      const success = sendMessage({
        recipientId: conversation.otherParticipantId,
        recipientName: conversation.otherParticipantName,
        conversationId: selectedConversation,
        productId: conversation.productId,
        productName: conversation.productName,
        message: replyText,
      })

      if (success) {
        setReplyText("")
        toast({
          title: "Message sent",
          description: "Your reply has been sent successfully.",
          duration: 3000,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Format timestamp to relative time
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  // Force reconnection function
  const handleForceReconnect = () => {
    console.log("[SellerMessages] Force reconnect requested by seller")
    setConnectionAttempts(0)
    reconnect()
    toast({
      title: "Reconnecting...",
      description: "Attempting to reconnect to messaging service.",
      duration: 3000,
    })
  }

  if (isConnecting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Connecting to messaging service...</span>
        <div className="ml-4 text-sm text-muted-foreground">Attempt {connectionAttempts}/3</div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <WifiOff className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 mb-2 text-xl font-semibold">Connection Issues</h3>
        <p className="text-gray-600 mb-4">
          Unable to connect to the messaging service. This prevents real-time messaging.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Steps:</h4>
          <ul className="list-disc text-left text-sm text-yellow-700 space-y-1">
            <li>
              Ensure the WebSocket server is running:{" "}
              <code className="bg-yellow-100 px-1 rounded">node websocket-server.js</code>
            </li>
            <li>Check if port 3001 is available and not blocked</li>
            <li>Verify your network connection allows WebSocket connections</li>
            <li>Try refreshing the page or clearing browser cache</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button onClick={handleForceReconnect} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconnect ({connectionAttempts}/3)
          </Button>

          <div className="text-xs text-muted-foreground mt-2">
            <p>
              User: {user?.id} ({user?.role})
            </p>
            <p>Connection attempts: {connectionAttempts}</p>
          </div>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 mb-2 text-xl font-semibold">No customer messages</h3>
        <p className="text-gray-600 mb-4">
          When customers contact you about products, their messages will appear here.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
          <div className="flex items-center justify-center mb-2">
            <Wifi className="h-4 w-4 text-green-500 mr-2" />
            <span className="font-medium">Connected</span>
          </div>

          <div className="text-left space-y-1 text-blue-800">
            <p>
              <strong>User:</strong> {user?.id} ({user?.role})
            </p>
            <p>
              <strong>Status:</strong> {isConnected ? "Connected" : "Disconnected"}
            </p>
            <p>
              <strong>Conversations:</strong> {conversations.length}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Filter messages for the selected conversation
  const conversationMessages = selectedConversation
    ? messages.filter((msg) => msg.conversationId === selectedConversation)
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 p-3 flex items-center justify-between">
            <h3 className="font-medium">Customer Conversations ({conversations.length})</h3>
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.conversationId ? "bg-muted/50" : ""
                  } relative`}
                  onClick={() => {
                    console.log("[SellerMessages] Selected conversation:", conversation)
                    setSelectedConversation(conversation.conversationId)
                    if (conversation.unreadCount > 0) {
                      markMessagesAsRead(conversation.conversationId)
                    }
                  }}
                >
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {conversation.otherParticipantName
                          ? conversation.otherParticipantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">
                          {conversation.otherParticipantName || "Unknown Customer"}
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          {conversation.lastMessage
                            ? formatMessageTime(conversation.lastMessage.timestamp)
                            : "No messages"}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {conversation.productName || "Unknown Product"}
                      </div>
                      <div className="text-sm truncate mt-1">
                        {conversation.lastMessage ? conversation.lastMessage.message : ""}
                      </div>
                    </div>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedConversation ? (
          <div className="flex h-full flex-col rounded-lg border">
            {(() => {
              const conversation = conversations.find((c) => c.conversationId === selectedConversation)
              return conversation ? (
                <div className="border-b bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {conversation.otherParticipantName
                            ? conversation.otherParticipantName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{conversation.otherParticipantName || "Unknown Customer"}</h3>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <span>About: </span>
                          <span className="font-medium ml-1">{conversation.productName || "Unknown Product"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null
            })()}

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages.length > 0 ? (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className="mt-1 text-right text-xs opacity-70">{formatMessageTime(message.timestamp)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-10 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending || !isConnected}
                  className="px-4"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Send</span>
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Press Enter to send, Shift+Enter for a new line</span>
                <div className="flex items-center">
                  {isConnected ? (
                    <span className="text-green-600 flex items-center">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border p-8 text-center">
            <div>
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 mb-2 text-xl font-semibold">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to view messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
