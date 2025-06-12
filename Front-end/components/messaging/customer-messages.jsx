"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { useWebSocket } from "@/context/websocket-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, CheckCircle2, MessageSquare, Send, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import TypingIndicator from "@/components/messaging/typing-indicator"

const CustomerMessages = () => {
  const { user } = useAuth()
  const {
    isConnected,
    isConnecting,
    conversations,
    messages,
    sendMessage,
    loadConversationMessages,
    markMessagesAsRead,
    reconnect,
    fallbackMode,
    sendTypingStart,
    sendTypingStop,
    getTypingUsers,
  } = useWebSocket()
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  // Debug logging
  useEffect(() => {
    console.log("[CustomerMessages] Current state:", {
      isConnected,
      isConnecting,
      conversationsCount: conversations.length,
      conversations: conversations,
      user: user,
      fallbackMode,
    })
  }, [isConnected, isConnecting, conversations, user, fallbackMode])

  // Clean up typing timeout on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Set loading state based on connection and conversations
  useEffect(() => {
    if (isConnected || fallbackMode) {
      setIsLoading(false)
    } else if (!isConnecting) {
      setIsLoading(false) // Show connection error instead of loading
    }
  }, [isConnected, isConnecting, fallbackMode])

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation && (isConnected || fallbackMode)) {
      loadConversationMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
    }
  }, [selectedConversation, isConnected, fallbackMode, loadConversationMessages, markMessagesAsRead])

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleTyping = useCallback(() => {
    if (!selectedConversation || (!isConnected && !fallbackMode)) return

    const conversation = conversations.find((c) => c.conversationId === selectedConversation)
    if (!conversation) return

    // Send typing start if not already typing
    if (!isTyping) {
      setIsTyping(true)
      sendTypingStart(selectedConversation, conversation.sellerId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingStop(selectedConversation, conversation.sellerId)
    }, 3000)
  }, [selectedConversation, isConnected, fallbackMode, conversations, isTyping, sendTypingStart, sendTypingStop])

  // Add this function to stop typing
  const stopTyping = useCallback(() => {
    if (!selectedConversation || !isTyping) return

    const conversation = conversations.find((c) => c.conversationId === selectedConversation)
    if (!conversation) return

    setIsTyping(false)
    sendTypingStop(selectedConversation, conversation.sellerId)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [selectedConversation, isTyping, conversations, sendTypingStop])

  // Update the handleSendReply function to work in both connected and fallback modes
  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim() || (!isConnected && !fallbackMode)) return

    // Stop typing when sending message
    stopTyping()

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
      // Ensure we're using the existing conversation ID which should already be properly formatted
      const success = sendMessage({
        recipientId: conversation.sellerId,
        recipientName: conversation.sellerName,
        conversationId: selectedConversation,
        productId: conversation.productId,
        productName: conversation.productName,
        message: replyText,
      })

      if (success) {
        setReplyText("")
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

  if (isConnecting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Connecting to messaging service...</span>
      </div>
    )
  }

  if (!isConnected && !fallbackMode) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h3 className="mt-4 mb-2 text-xl font-semibold">Connection Status</h3>
        <p className="text-gray-600 mb-4">Could not connect to the messaging service. This could be because:</p>
        <ul className="list-disc text-left max-w-md mx-auto mb-4">
          <li className="mb-2">
            The WebSocket server is not running (run <code>node websocket-server.js</code>)
          </li>
          <li className="mb-2">Your network connection is blocking WebSocket connections</li>
          <li className="mb-2">There's a temporary service disruption</li>
        </ul>

        <Button onClick={reconnect} className="mb-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>

        <p className="text-sm text-muted-foreground mt-4">
          If the problem persists, please try again later or contact support.
        </p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 mb-2 text-xl font-semibold">No messages yet</h3>
        <p className="text-gray-600">When you contact sellers about products, your messages will appear here.</p>
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
          <p className="font-medium">Debug Info:</p>
          <p>Connected: {isConnected ? "Yes" : "No"}</p>
          <p>Fallback Mode: {fallbackMode ? "Yes" : "No"}</p>
          <p>User ID: {user?.id}</p>
          <p>User Role: {user?.role}</p>
          <p>User Name: {user?.name}</p>
          <p>Conversations Count: {conversations.length}</p>
          <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
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
            <h3 className="font-medium">Conversations ({conversations.length})</h3>
            <div className="flex items-center">
              <Badge variant={isConnected ? "success" : fallbackMode ? "secondary" : "destructive"} className="text-xs">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : fallbackMode ? (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Offline
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
            </div>
          </div>
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  className={`w-full p-3 text-left hover:bg-muted/50 ${
                    selectedConversation === conversation.conversationId ? "bg-muted/50" : ""
                  } relative`}
                  onClick={() => {
                    console.log("[CustomerMessages] Selected conversation:", conversation)
                    setSelectedConversation(conversation.conversationId)
                    if (conversation.unreadCount > 0) {
                      markMessagesAsRead(conversation.conversationId)
                    }
                  }}
                >
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {conversation.sellerName
                          ? conversation.sellerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{conversation.sellerName || "Unknown Seller"}</div>
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
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {conversation.sellerName
                          ? conversation.sellerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{conversation.sellerName || "Unknown Seller"}</h3>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span>About: </span>
                        <span className="font-medium ml-1">{conversation.productName || "Unknown Product"}</span>
                        {fallbackMode && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Mock Data
                          </Badge>
                        )}
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

                {/* Add typing indicator here */}
                {selectedConversation && <TypingIndicator users={getTypingUsers(selectedConversation)} />}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value)
                    handleTyping()
                  }}
                  className="min-h-10 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                  onBlur={stopTyping}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending || (!isConnected && !fallbackMode)}
                  className="px-4"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Send</span>
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for a new line
                {fallbackMode && <span className="ml-2 text-amber-600">(Offline Mode)</span>}
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

export default CustomerMessages
