"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { websocketManager } from "@/lib/websocket-manager"

const WebSocketContext = createContext()

export function WebSocketProvider({ children }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [connectionState, setConnectionState] = useState("DISCONNECTED")
  const [conversations, setConversations] = useState([])
  const [currentMessages, setCurrentMessages] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState([])

  const isConnected = connectionState === "CONNECTED"

  // Enhanced connection effect with auth token support
  useEffect(() => {
    if (user) {
      console.log("🔌 Setting up WebSocket connection for user:", {
        userId: user.id,
        userRole: user.role,
        userName: user.name || "Anonymous",
        hasToken: !!(typeof window !== "undefined" && localStorage.getItem("auth_token")),
      })

      // Get auth token from localStorage (with safety check)
      let authToken = null
      try {
        if (typeof window !== "undefined" && localStorage) {
          authToken = localStorage.getItem("auth_token")
        }
      } catch (error) {
        console.warn("⚠️ Cannot access localStorage:", error.message)
      }

      // Set up event listeners first
      const handleConnected = () => {
        console.log("✅ WebSocket connected in context")
        setConnectionState("CONNECTED")
        if (toast) {
          toast({
            title: "Connected",
            description: "Real-time messaging is now active.",
            duration: 3000,
          })
        }
      }

      const handleDisconnected = () => {
        console.log("🔌 WebSocket disconnected in context")
        setConnectionState("DISCONNECTED")
      }

      const handleReconnecting = (data) => {
        console.log("🔄 WebSocket reconnecting in context:", data)
        setConnectionState("RECONNECTING")
        if (toast) {
          toast({
            title: "Reconnecting",
            description: "Attempting to restore connection...",
            duration: 3000,
          })
        }
      }

      const handleError = (error) => {
        console.error("❌ WebSocket error in context:", error)
        setConnectionState("ERROR")
        if (toast) {
          toast({
            title: "Connection Error",
            description: typeof error === "string" ? error : "WebSocket connection failed",
            variant: "destructive",
            duration: 5000,
          })
        }
      }

      const handleConversationsList = (conversationsData) => {
        if (!Array.isArray(conversationsData)) {
          console.warn("⚠️ Invalid conversations data received:", conversationsData)
          return
        }

        console.log("📋 Received conversations list:", conversationsData.length)
        setConversations(conversationsData)

        // Calculate total unread count safely
        const totalUnread = conversationsData.reduce((sum, conv) => {
          const unreadCount = conv && typeof conv.unreadCount === "number" ? conv.unreadCount : 0
          return sum + unreadCount
        }, 0)
        setUnreadCount(totalUnread)
      }

      const handleConversationMessages = (messages) => {
        if (!Array.isArray(messages)) {
          console.warn("⚠️ Invalid messages data received:", messages)
          return
        }

        console.log("💬 Received conversation messages:", messages.length)
        setCurrentMessages(messages)
      }

      const handleNewMessage = (message) => {
        if (!message || typeof message !== "object") {
          console.warn("⚠️ Invalid message received:", message)
          return
        }

        console.log("📨 Received new message:", message)

        // Add to current messages if it's for the current conversation
        setCurrentMessages((prev) => {
          if (!Array.isArray(prev)) {
            console.warn("⚠️ Previous messages is not an array, resetting")
            return [message]
          }

          const isCurrentConversation = message.conversationId === currentConversation

          if (isCurrentConversation) {
            // Check for duplicate messages
            const isDuplicate = prev.some((m) => m && m.id === message.id)
            if (isDuplicate) {
              console.log("⚠️ Duplicate message detected, skipping")
              return prev
            }

            // Mark message as delivered if it's for current conversation
            if (message.senderId !== user?.id) {
              websocketManager.sendMessage("mark_message_delivered", { messageId: message.id })
            }

            return [...prev, message]
          }
          return prev
        })

        // Request updated conversations list
        websocketManager.sendMessage("get_conversations", {})

        // Show notification for new messages from others
        if (message.senderId !== user?.id && toast) {
          toast({
            title: `New message from ${message.senderName || "Unknown"}`,
            description:
              message.message && message.message.length > 50
                ? `${message.message.substring(0, 50)}...`
                : message.message || "New message received",
            duration: 5000,
          })
        }
      }

      const handleMessageSent = (message) => {
        if (!message || typeof message !== "object") {
          console.warn("⚠️ Invalid sent message received:", message)
          return
        }

        console.log("✅ Message sent confirmation:", message)

        // Add to current messages safely
        setCurrentMessages((prev) => {
          if (!Array.isArray(prev)) {
            console.warn("⚠️ Previous messages is not an array, resetting")
            return [message]
          }

          // Check for duplicate messages
          const isDuplicate = prev.some((m) => m && m.id === message.id)
          if (isDuplicate) {
            console.log("⚠️ Duplicate sent message detected, skipping")
            return prev
          }

          return [...prev, message]
        })

        // Request updated conversations list
        websocketManager.sendMessage("get_conversations", {})
      }

      const handleMessageStatusUpdate = (data) => {
        console.log("📊 Message status update:", data)

        setCurrentMessages((prev) => {
          return prev.map((message) => {
            if (message.id === data.messageId) {
              return { ...message, status: data.status }
            }
            return message
          })
        })
      }

      const handleTypingStatus = (data) => {
        console.log("⌨️ Typing status:", data)

        setTypingUsers((prev) => {
          if (data.isTyping) {
            // Add user to typing list if not already there
            const isAlreadyTyping = prev.some((u) => u.userId === data.userId)
            if (!isAlreadyTyping) {
              return [...prev, { userId: data.userId, userName: data.userName }]
            }
            return prev
          } else {
            // Remove user from typing list
            return prev.filter((u) => u.userId !== data.userId)
          }
        })
      }

      // Register event listeners
      const cleanupFunctions = []
      cleanupFunctions.push(websocketManager.on("connected", handleConnected))
      cleanupFunctions.push(websocketManager.on("disconnected", handleDisconnected))
      cleanupFunctions.push(websocketManager.on("reconnecting", handleReconnecting))
      cleanupFunctions.push(websocketManager.on("error", handleError))
      cleanupFunctions.push(websocketManager.on("conversations_list", handleConversationsList))
      cleanupFunctions.push(websocketManager.on("conversation_messages", handleConversationMessages))
      cleanupFunctions.push(websocketManager.on("new_message", handleNewMessage))
      cleanupFunctions.push(websocketManager.on("message_sent", handleMessageSent))
      cleanupFunctions.push(websocketManager.on("message_status_update", handleMessageStatusUpdate))
      cleanupFunctions.push(websocketManager.on("typing_status", handleTypingStatus))

      // Connect with auth token
      websocketManager
        .connect(user.id, user.role, user.name || "Anonymous", authToken)
        .then(() => {
          console.log("✅ WebSocket connection initiated successfully")
        })
        .catch((error) => {
          console.error("❌ Failed to connect WebSocket:", error)
          setConnectionState("ERROR")
        })

      // Cleanup function
      return () => {
        console.log("🧹 Cleaning up WebSocket event listeners")
        cleanupFunctions.forEach((cleanup) => {
          if (typeof cleanup === "function") {
            try {
              cleanup()
            } catch (error) {
              console.warn("⚠️ Error during cleanup:", error.message)
            }
          }
        })
      }
    } else {
      // Disconnect if no user
      console.log("👤 No user, disconnecting WebSocket")
      websocketManager.disconnect()
      setConnectionState("DISCONNECTED")
      setConversations([])
      setCurrentMessages([])
      setCurrentConversation(null)
      setUnreadCount(0)
      setTypingUsers([])
    }
  }, [user, toast])

  // Update auth token when it changes
  useEffect(() => {
    let authToken = null
    try {
      if (typeof window !== "undefined" && localStorage && user) {
        authToken = localStorage.getItem("auth_token")
      }
    } catch (error) {
      console.warn("⚠️ Cannot access localStorage for token update:", error.message)
    }

    if (authToken && user) {
      websocketManager.updateAuthToken(authToken)
    }
  }, [user])






  // the main part 
  const sendMessage = (recipientId, message, productId = null, productName = null, recipientName = null) => {
    // Enhanced logging to debug the issue
    console.log("📤 sendMessage called with parameters:", {
      recipientId,
      message,
      messageType: typeof message,
      messageValue: message,
      productId,
      productName,
      recipientName,
      argumentsLength: arguments.length,
      allArguments: Array.from(arguments),
    })

    // Check if message is passed as an object (common mistake)
    let actualMessage = message
    if (typeof message === "object" && message !== null) {
      // If message is an object, try to extract the actual message
      if (message.message) {
        actualMessage = message.message
        console.log("📝 Extracted message from object:", actualMessage)
      } else if (message.text) {
        actualMessage = message.text
        console.log("📝 Extracted text from object:", actualMessage)
      } else if (message.content) {
        actualMessage = message.content
        console.log("📝 Extracted content from object:", actualMessage)
      } else {
        console.error("❌ Message object doesn't contain expected properties:", message)
      }
    }

    // Validate required parameters
    if (!recipientId) {
      console.error("❌ Cannot send message: recipientId is required")
      if (toast) {
        toast({
          title: "Error",
          description: "Recipient ID is required to send a message",
          variant: "destructive",
        })
      }
      return false
    }

    if (!actualMessage || typeof actualMessage !== "string") {
      console.error("❌ Cannot send message: message must be a non-empty string", {
        originalMessage: message,
        actualMessage,
        type: typeof actualMessage,
      })
      if (toast) {
        toast({
          title: "Error",
          description: "Message content is required and must be text",
          variant: "destructive",
        })
      }
      return false
    }

    if (actualMessage.trim().length === 0) {
      console.error("❌ Cannot send message: message cannot be empty")
      if (toast) {
        toast({
          title: "Error",
          description: "Message cannot be empty",
          variant: "destructive",
        })
      }
      return false
    }

    console.log("📤 Sending message via context:", {
      recipientId,
      messageLength: actualMessage.length,
      productId,
      productName,
      recipientName,
      isConnected,
    })

    if (!isConnected) {
      console.error("❌ Cannot send message: WebSocket not connected")
      if (toast) {
        toast({
          title: "Connection Error",
          description: "Cannot send message. Please check your connection.",
          variant: "destructive",
        })
      }
      return false
    }

    try {
      const success = websocketManager.sendMessage("send_message", {
        recipientId: String(recipientId),
        message: actualMessage.trim(),
        productId: productId ? String(productId) : null,
        productName: productName || null,
        recipientName: recipientName || null,
      })

      if (success) {
        console.log("✅ Message sent successfully")
      } else {
        console.error("❌ Failed to send message")
        if (toast) {
          toast({
            title: "Send Failed",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          })
        }
      }

      return success
    } catch (error) {
      console.error("❌ Error sending message:", error)
      if (toast) {
        toast({
          title: "Send Error",
          description: "An error occurred while sending the message.",
          variant: "destructive",
        })
      }
      return false
    }
  }

  const sendTypingStatus = (conversationId, isTyping) => {
    if (!isConnected || !conversationId) return false

    return websocketManager.sendMessage("typing_status", {
      conversationId,
      isTyping,
    })
  }

  const getConversations = () => {
    console.log("📋 Requesting conversations list")
    return websocketManager.sendMessage("get_conversations", {})
  }

  const getMessages = (conversationId) => {
    if (!conversationId) {
      console.error("❌ Cannot get messages: conversationId is required")
      return false
    }

    console.log("💬 Requesting messages for conversation:", conversationId)
    setCurrentConversation(conversationId) // Set the current conversation
    setCurrentMessages([]) // Clear current messages while loading
    setTypingUsers([]) // Clear typing users when switching conversations
    return websocketManager.sendMessage("get_messages", { conversationId })
  }

  const value = {
    connectionState,
    conversations: Array.isArray(conversations) ? conversations : [],
    currentMessages: Array.isArray(currentMessages) ? currentMessages : [],
    currentConversation,
    unreadCount: typeof unreadCount === "number" ? unreadCount : 0,
    typingUsers: Array.isArray(typingUsers) ? typingUsers : [],
    sendMessage,
    sendTypingStatus,
    getConversations,
    getMessages,
    isConnected,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
