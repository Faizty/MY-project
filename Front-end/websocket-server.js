// Enhanced WebSocket Server with robust product ownership validation and typing support
const WebSocket = require("ws")
const http = require("http")
const url = require("url")
const crypto = require("crypto")
const axios = require("axios")

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080"

// Create HTTP server
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === "/health") {
    const connectedUsers = Array.from(clients.entries()).map(([userId, client]) => ({
      userId,
      userRole: client.userRole,
      userName: client.userName,
      connectedAt: client.connectedAt,
      connectionState: client.ws.readyState === WebSocket.OPEN ? "OPEN" : "CLOSED",
      hasToken: !!client.authToken,
    }))

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "ok",
        connections: clients.size,
        timestamp: new Date().toISOString(),
        connectedUsers,
        totalConversations: conversations.size,
        cacheEntries: sellerProductsCache.size,
        ownershipCacheEntries: productOwnershipCache.size,
        typingUsers: typingStatus.size,
      }),
    )
    return
  }

  res.writeHead(404)
  res.end("Not Found")
})

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Store active connections, messages, cached product ownership, and typing status
const clients = new Map()
const conversations = new Map()
const sellerProductsCache = new Map()
const productOwnershipCache = new Map() // productId -> sellerId mapping
const typingStatus = new Map() // conversationId -> Set of typing users

// Enhanced logging with better formatting
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString()
  const emoji =
    {
      INFO: "ℹ️",
      SUCCESS: "✅",
      WARN: "⚠️",
      ERROR: "❌",
      DEBUG: "🔍",
    }[level] || "📝"

  console.log(`[${timestamp}] ${emoji} [${level}] ${message}`, Object.keys(data).length > 0 ? data : "")
}

// Generate a unique ID
function generateId() {
  return crypto.randomBytes(8).toString("hex")
}

// Normalize user ID to string
function normalizeUserId(userId) {
  return String(userId)
}

// Convert string ID to number for API calls
function toNumericId(id) {
  return Number(id) || 0
}

// Clear all caches for a seller
function clearSellerCache(sellerId) {
  const sellerIdStr = String(sellerId)

  // Clear seller products cache
  if (sellerProductsCache.has(sellerIdStr)) {
    log("INFO", "Clearing seller products cache", { sellerId: sellerIdStr })
    sellerProductsCache.delete(sellerIdStr)
  }

  // Clear product ownership cache entries for this seller
  const entriesToDelete = []
  for (const [productId, ownerId] of productOwnershipCache.entries()) {
    if (String(ownerId) === sellerIdStr) {
      entriesToDelete.push(productId)
    }
  }

  entriesToDelete.forEach((productId) => {
    log("INFO", "Clearing product ownership cache entry", { productId, sellerId: sellerIdStr })
    productOwnershipCache.delete(productId)
  })

  log("INFO", "Cache cleanup completed", {
    sellerId: sellerIdStr,
    ownershipEntriesCleared: entriesToDelete.length,
  })
}

// Fetch seller products with enhanced error handling
async function fetchSellerProducts(sellerId, authToken = null) {
  const sellerIdStr = String(sellerId)
  const numericSellerId = toNumericId(sellerId)

  try {
    // Get auth token if not provided
    if (!authToken) {
      const client = clients.get(sellerIdStr)
      if (!client || !client.authToken) {
        throw new Error(`No authentication token available for seller: ${sellerIdStr}`)
      }
      authToken = client.authToken
    }

    log("INFO", "Fetching seller products via API", {
      sellerId: sellerIdStr,
      numericSellerId,
      hasToken: !!authToken,
    })

    const response = await axios.get(`${API_BASE_URL}/api/products/Seller/${numericSellerId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 10000, // 10 second timeout
    })

    const products = response.data || []

    log("SUCCESS", "Seller products fetched successfully", {
      sellerId: sellerIdStr,
      productCount: products.length,
      productIds: products.map((p) => String(p.id)),
    })

    // Update product ownership cache
    products.forEach((product) => {
      const productIdStr = String(product.id)
      const productSellerId = String(product.seller_id)

      productOwnershipCache.set(productIdStr, productSellerId)

      log("DEBUG", "Updated product ownership cache", {
        productId: productIdStr,
        sellerId: productSellerId,
        productName: product.name,
      })
    })

    // Cache the products
    sellerProductsCache.set(sellerIdStr, {
      products,
      timestamp: Date.now(),
    })

    return products
  } catch (error) {
    log("ERROR", "Failed to fetch seller products", {
      sellerId: sellerIdStr,
      error: error.message,
      status: error.response?.status,
    })
    return []
  }
}

// Find product owner with comprehensive lookup
async function findProductOwner(productId) {
  const productIdStr = String(productId)

  if (!productId) {
    log("WARN", "Cannot find product owner - no productId provided")
    return null
  }

  // Check ownership cache first
  if (productOwnershipCache.has(productIdStr)) {
    const cachedOwnerId = productOwnershipCache.get(productIdStr)
    log("DEBUG", "Found product owner in cache", {
      productId: productIdStr,
      ownerId: cachedOwnerId,
    })
    return cachedOwnerId
  }

  log("INFO", "Product owner not in cache, searching all connected sellers", {
    productId: productIdStr,
    connectedSellers: Array.from(clients.entries())
      .filter(([_, client]) => client.userRole === "seller")
      .map(([id, _]) => id),
  })

  // Search through all connected sellers
  for (const [userId, client] of clients.entries()) {
    if (client.userRole === "seller" && client.authToken) {
      try {
        log("DEBUG", "Checking seller for product ownership", {
          sellerId: userId,
          productId: productIdStr,
        })

        const products = await fetchSellerProducts(userId, client.authToken)
        const ownedProduct = products.find((p) => String(p.id) === productIdStr)

        if (ownedProduct) {
          log("SUCCESS", "Found product owner", {
            productId: productIdStr,
            ownerId: userId,
            productName: ownedProduct.name,
            sellerIdFromProduct: ownedProduct.seller_id,
          })

          // Update cache
          productOwnershipCache.set(productIdStr, userId)
          return userId
        }
      } catch (error) {
        log("ERROR", "Error checking seller for product ownership", {
          sellerId: userId,
          productId: productIdStr,
          error: error.message,
        })
      }
    }
  }

  log("WARN", "Could not find owner for product", {
    productId: productIdStr,
    searchedSellers: Array.from(clients.entries()).filter(([_, client]) => client.userRole === "seller").length,
  })
  return null
}

// Validate product ownership
async function validateProductOwnership(sellerId, productId) {
  const sellerIdStr = String(sellerId)
  const productIdStr = String(productId)

  if (!sellerId || !productId) {
    log("WARN", "Missing parameters for ownership validation", { sellerId, productId })
    return false
  }

  try {
    log("DEBUG", "Validating product ownership", { sellerId: sellerIdStr, productId: productIdStr })

    // Check cache first
    const cachedOwnerId = productOwnershipCache.get(productIdStr)
    if (cachedOwnerId) {
      const isOwner = cachedOwnerId === sellerIdStr
      log("DEBUG", "Ownership validation from cache", {
        productId: productIdStr,
        sellerId: sellerIdStr,
        cachedOwnerId,
        isOwner,
      })
      return isOwner
    }

    // Fetch fresh data
    const products = await fetchSellerProducts(sellerIdStr)
    const ownedProduct = products.find((p) => String(p.id) === productIdStr)
    const isOwner = !!ownedProduct

    log(isOwner ? "SUCCESS" : "WARN", "Product ownership validation result", {
      sellerId: sellerIdStr,
      productId: productIdStr,
      isOwner,
      productName: ownedProduct?.name || "Not found",
    })

    return isOwner
  } catch (error) {
    log("ERROR", "Error validating product ownership", {
      sellerId: sellerIdStr,
      productId: productIdStr,
      error: error.message,
    })
    return false
  }
}

// Handle WebSocket connection
wss.on("connection", function connection(ws, req) {
  const parameters = url.parse(req.url, true).query
  const userId = normalizeUserId(parameters.userId)
  const userRole = parameters.userRole || "customer"
  const userName = parameters.userName || "Anonymous"
  const authToken = parameters.authToken

  log("INFO", "New connection attempt", {
    userId,
    userRole,
    userName,
    hasToken: !!authToken,
  })

  if (!userId) {
    log("ERROR", "Connection rejected - no userId provided")
    ws.close(1008, "User ID required")
    return
  }

  if (userRole === "seller" && !authToken) {
    log("ERROR", "Connection rejected - sellers require authentication token", { userId, userRole })
    ws.close(1008, "Authentication token required for sellers")
    return
  }

  // Clear cache for reconnecting sellers
  if (userRole === "seller") {
    clearSellerCache(userId)
  }

  // Store client connection
  clients.set(userId, {
    ws,
    userRole,
    userName,
    authToken,
    connectedAt: new Date().toISOString(),
  })

  log("SUCCESS", "User connected successfully", {
    userId,
    userName,
    userRole,
    totalConnections: clients.size,
  })

  // Send welcome message
  sendToClient(ws, {
    type: "connection_established",
    data: {
      userId,
      userRole,
      userName,
      timestamp: new Date().toISOString(),
      serverInfo: {
        connections: clients.size,
        conversations: conversations.size,
      },
    },
  })

  // Send initial conversations list
  setTimeout(() => {
    sendConversationsList(userId)
  }, 500)

  // Handle incoming messages
  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message)
      log("INFO", "Message received", {
        type: data.type,
        userId,
        userRole,
        dataKeys: Object.keys(data.data || {}),
      })
      handleMessage(userId, userRole, userName, data, ws)
    } catch (error) {
      log("ERROR", "Error processing message", { error: error.message, userId })
      sendError(ws, "Invalid message format")
    }
  })

  // Handle disconnection
  ws.on("close", (code, reason) => {
    log("INFO", "User disconnected", { userId, code, reason: reason.toString() })

    if (userRole === "seller") {
      clearSellerCache(userId)
    }

    // Clear typing status for this user
    clearUserTypingStatus(userId)

    clients.delete(userId)
    log("INFO", "Connections after disconnect", { remaining: clients.size })
  })

  // Handle WebSocket errors
  ws.on("error", (error) => {
    log("ERROR", "WebSocket error", { userId, error: error.message })

    if (userRole === "seller") {
      clearSellerCache(userId)
    }

    // Clear typing status for this user
    clearUserTypingStatus(userId)

    clients.delete(userId)
  })
})

// Clear typing status for a user across all conversations
function clearUserTypingStatus(userId) {
  for (const [conversationId, typingUsers] of typingStatus.entries()) {
    if (typingUsers.has(userId)) {
      typingUsers.delete(userId)

      // Broadcast typing status update
      broadcastTypingStatus(conversationId)

      // Clean up empty typing status entries
      if (typingUsers.size === 0) {
        typingStatus.delete(conversationId)
      }
    }
  }
}

// Broadcast typing status to conversation participants
function broadcastTypingStatus(conversationId) {
  const typingUsers = typingStatus.get(conversationId)
  if (!typingUsers) return

  // Get conversation participants
  const conversationMessages = conversations.get(conversationId) || []
  if (conversationMessages.length === 0) return

  const participants = new Set()
  conversationMessages.forEach((msg) => {
    participants.add(msg.senderId)
    participants.add(msg.recipientId)
  })

  // Send typing status to each participant
  participants.forEach((participantId) => {
    const client = clients.get(participantId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      const otherTypingUsers = Array.from(typingUsers)
        .filter((userId) => userId !== participantId)
        .map((userId) => {
          const userClient = clients.get(userId)
          return {
            userId,
            userName: userClient?.userName || "Unknown",
          }
        })

      sendToClient(client.ws, {
        type: "typing_status",
        data: {
          conversationId,
          typingUsers: otherTypingUsers,
        },
      })
    }
  })
}

// Handle different message types
function handleMessage(userId, userRole, userName, data, ws) {
  switch (data.type) {
    case "send_message":
      handleSendMessage(userId, userRole, userName, data.data, ws)
      break
    case "get_conversations":
      sendConversationsList(userId)
      break
    case "get_messages":
      handleGetMessages(userId, data.data.conversationId, ws)
      break
    case "typing_status":
      handleTypingStatus(userId, userName, data.data, ws)
      break
    case "mark_message_delivered":
      handleMarkMessageDelivered(userId, data.data, ws)
      break
    case "ping":
      sendToClient(ws, { type: "pong", timestamp: new Date().toISOString() })
      break
    default:
      log("WARN", "Unknown message type", { type: data.type, userId })
      sendError(ws, `Unknown message type: ${data.type}`)
  }
}

// Handle typing status updates
function handleTypingStatus(userId, userName, data, ws) {
  const { conversationId, isTyping } = data

  if (!conversationId) {
    log("ERROR", "Missing conversationId for typing status")
    sendError(ws, "Missing conversationId for typing status")
    return
  }

  log("INFO", "Handling typing status", {
    userId,
    userName,
    conversationId,
    isTyping,
  })

  // Initialize typing status for conversation if needed
  if (!typingStatus.has(conversationId)) {
    typingStatus.set(conversationId, new Set())
  }

  const typingUsers = typingStatus.get(conversationId)

  if (isTyping) {
    typingUsers.add(userId)
  } else {
    typingUsers.delete(userId)
  }

  // Clean up empty typing status
  if (typingUsers.size === 0) {
    typingStatus.delete(conversationId)
  }

  // Broadcast typing status to conversation participants
  broadcastTypingStatus(conversationId)

  log("SUCCESS", "Typing status updated", {
    conversationId,
    userId,
    isTyping,
    totalTypingUsers: typingUsers.size,
  })
}

// Handle mark message as delivered
function handleMarkMessageDelivered(userId, data, ws) {
  const { messageId } = data

  if (!messageId) {
    log("ERROR", "Missing messageId for delivery confirmation")
    sendError(ws, "Missing messageId for delivery confirmation")
    return
  }

  log("INFO", "Marking message as delivered", { messageId, userId })

  // Find the message and update its status
  let messageFound = false
  for (const [conversationId, messages] of conversations.entries()) {
    const message = messages.find((msg) => msg.id === messageId)
    if (message) {
      message.status = "delivered"
      messageFound = true

      // Notify the sender about delivery status
      const sender = clients.get(message.senderId)
      if (sender && sender.ws.readyState === WebSocket.OPEN) {
        sendToClient(sender.ws, {
          type: "message_status_update",
          data: {
            messageId,
            status: "delivered",
          },
        })
      }

      log("SUCCESS", "Message marked as delivered", {
        messageId,
        conversationId,
        senderId: message.senderId,
        recipientId: userId,
      })
      break
    }
  }

  if (!messageFound) {
    log("WARN", "Message not found for delivery confirmation", { messageId })
  }
}

// Enhanced send message handler with robust validation
async function handleSendMessage(userId, userRole, userName, messageData, ws) {
  let recipientId = normalizeUserId(messageData.recipientId)
  const message = messageData.message
  const productId = messageData.productId
  const productName = messageData.productName
  const recipientName = messageData.recipientName

  log("INFO", "Processing send_message", {
    senderId: userId,
    senderRole: userRole,
    originalRecipientId: recipientId,
    productId,
    productName,
    messageLength: message?.length,
  })

  // Validate required fields
  if (!message || !message.trim()) {
    log("ERROR", "Missing or empty message")
    sendError(ws, "Message content is required")
    return
  }

  // For customer messages with product ID, ensure correct recipient
  if (userRole === "customer" && productId) {
    log("INFO", "Customer message about product - finding correct seller", {
      customerId: userId,
      productId,
      originalRecipient: recipientId,
    })

    const correctSellerId = await findProductOwner(productId)

    if (correctSellerId) {
      if (correctSellerId !== recipientId) {
        log("INFO", "Correcting recipient to actual product owner", {
          originalRecipient: recipientId,
          correctRecipient: correctSellerId,
          productId,
        })
        recipientId = correctSellerId
      } else {
        log("SUCCESS", "Recipient is correct product owner", {
          recipientId,
          productId,
        })
      }
    } else {
      log("WARN", "Could not find product owner, using original recipient", {
        productId,
        originalRecipient: recipientId,
      })
    }
  }

  // Final validation of recipient
  if (!recipientId) {
    log("ERROR", "No valid recipient found")
    sendError(ws, "Unable to determine message recipient")
    return
  }

  // Validate seller product ownership for seller messages
  if (userRole === "seller" && productId) {
    log("INFO", "Validating seller product ownership", { sellerId: userId, productId })

    const ownsProduct = await validateProductOwnership(userId, productId)
    if (!ownsProduct) {
      log("ERROR", "Seller does not own this product", { sellerId: userId, productId })
      sendError(ws, "You can only send messages about products you own")
      return
    }

    log("SUCCESS", "Seller product ownership validated", { sellerId: userId, productId })
  }

  // Check recipient connection
  const recipient = clients.get(recipientId)
  log("INFO", "Recipient lookup", {
    recipientId,
    found: !!recipient,
    isConnected: recipient ? recipient.ws.readyState === WebSocket.OPEN : false,
    recipientRole: recipient?.userRole || "unknown",
  })

  // Create conversation ID
  const participants = [userId, recipientId].sort()
  let conversationId = `conv_${participants[0]}_${participants[1]}`
  if (productId) {
    conversationId += `_${productId}`
  }

  // Create message object
  const newMessage = {
    id: generateId(),
    conversationId,
    senderId: userId,
    senderName: userName,
    senderRole: userRole,
    recipientId,
    recipientName: recipient?.userName || recipientName || "Unknown User",
    productId: productId || null,
    productName: productName || null,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    read: false,
    status: "sent", // Initial status
  }

  log("INFO", "Message created", {
    messageId: newMessage.id,
    conversationId,
    from: `${userId} (${userRole})`,
    to: `${recipientId} (${recipient?.userRole || "unknown"})`,
    productId: newMessage.productId,
  })

  // Store message
  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, [])
    log("INFO", "New conversation created", { conversationId })
  }

  conversations.get(conversationId).push(newMessage)
  log("SUCCESS", "Message stored", {
    conversationId,
    totalMessages: conversations.get(conversationId).length,
  })

  // Clear typing status for sender
  const typingUsers = typingStatus.get(conversationId)
  if (typingUsers && typingUsers.has(userId)) {
    typingUsers.delete(userId)
    broadcastTypingStatus(conversationId)
  }

  // Send confirmation to sender
  sendToClient(ws, {
    type: "message_sent",
    data: newMessage,
  })

  // Send to recipient if online
  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    log("INFO", "Delivering message to online recipient", { recipientId })
    sendToClient(recipient.ws, {
      type: "new_message",
      data: newMessage,
    })

    // Update recipient's conversations list
    setTimeout(() => sendConversationsList(recipientId), 100)
  } else {
    log("WARN", "Recipient offline, message stored for later", { recipientId })
  }

  // Update sender's conversations list
  setTimeout(() => sendConversationsList(userId), 100)
}

// Enhanced conversations list with proper filtering
async function sendConversationsList(userId) {
  const client = clients.get(userId)
  if (!client || client.ws.readyState !== WebSocket.OPEN) {
    log("WARN", "Cannot send conversations list - client not available", { userId })
    return
  }

  log("INFO", "Building conversations list", { userId, userRole: client.userRole })

  const userConversations = []
  let sellerProducts = []

  // For sellers, get their products for filtering
  if (client.userRole === "seller") {
    try {
      sellerProducts = await fetchSellerProducts(userId, client.authToken)
      log("INFO", "Seller products loaded for filtering", {
        sellerId: userId,
        productCount: sellerProducts.length,
      })
    } catch (error) {
      log("ERROR", "Failed to load seller products for filtering", {
        sellerId: userId,
        error: error.message,
      })
    }
  }

  // Process conversations
  for (const [conversationId, messages] of conversations.entries()) {
    if (messages.length === 0) continue

    // Check if user is participant
    const isParticipant = messages.some((msg) => msg.senderId === userId || msg.recipientId === userId)

    if (!isParticipant) continue

    const firstMessage = messages[0]
    const productId = firstMessage.productId

    // For sellers, filter by product ownership
    if (client.userRole === "seller" && productId) {
      const ownsProduct = sellerProducts.some(
        (product) => String(product.id) === String(productId) && String(product.seller_id) === String(userId),
      )

      if (!ownsProduct) {
        log("DEBUG", "Filtering out conversation - seller doesn't own product", {
          conversationId,
          sellerId: userId,
          productId,
        })
        continue
      }
    }

    // Build conversation object
    const lastMessage = messages[messages.length - 1]
    let otherParticipantId, otherParticipantName

    for (const msg of messages) {
      if (msg.senderId === userId) {
        otherParticipantId = msg.recipientId
        otherParticipantName = msg.recipientName
        break
      } else if (msg.recipientId === userId) {
        otherParticipantId = msg.senderId
        otherParticipantName = msg.senderName
        break
      }
    }

    const unreadCount = messages.filter((msg) => msg.recipientId === userId && !msg.read).length

    userConversations.push({
      conversationId,
      otherParticipantId,
      otherParticipantName,
      lastMessage,
      unreadCount,
      productId: firstMessage.productId,
      productName: firstMessage.productName,
    })
  }

  // Sort by last message timestamp
  userConversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))

  log("SUCCESS", "Sending conversations list", {
    userId,
    userRole: client.userRole,
    conversationCount: userConversations.length,
    totalConversationsChecked: conversations.size,
  })

  sendToClient(client.ws, {
    type: "conversations_list",
    data: userConversations,
  })
}

// Get messages for a conversation
async function handleGetMessages(userId, conversationId, ws) {
  log("INFO", "Getting messages for conversation", { userId, conversationId })

  if (!conversationId) {
    sendError(ws, "Missing conversationId")
    return
  }

  const messages = conversations.get(conversationId) || []

  // Check if user is participant
  const isParticipant = messages.some((msg) => msg.senderId === userId || msg.recipientId === userId)

  if (messages.length > 0 && !isParticipant) {
    log("ERROR", "User not participant in conversation", { userId, conversationId })
    sendError(ws, "You are not a participant in this conversation")
    return
  }

  // Additional validation for sellers
  const client = clients.get(userId)
  if (client?.userRole === "seller" && messages.length > 0) {
    const productId = messages[0].productId
    if (productId) {
      const ownsProduct = await validateProductOwnership(userId, productId)
      if (!ownsProduct) {
        log("ERROR", "Seller does not own product in conversation", {
          userId,
          conversationId,
          productId,
        })
        sendError(ws, "You can only view conversations about products you own")
        return
      }
    }
  }

  // Mark messages as read and update status
  let markedAsRead = 0
  messages.forEach((msg) => {
    if (msg.recipientId === userId && !msg.read) {
      msg.read = true
      msg.status = "read"
      markedAsRead++

      // Notify sender about read status
      const sender = clients.get(msg.senderId)
      if (sender && sender.ws.readyState === WebSocket.OPEN) {
        sendToClient(sender.ws, {
          type: "message_status_update",
          data: {
            messageId: msg.id,
            status: "read",
          },
        })
      }
    }
  })

  log("SUCCESS", "Sending conversation messages", {
    userId,
    conversationId,
    messageCount: messages.length,
    markedAsRead,
  })

  sendToClient(ws, {
    type: "conversation_messages",
    data: messages,
  })

  // Update conversations list if messages were marked as read
  if (markedAsRead > 0) {
    setTimeout(() => sendConversationsList(userId), 100)
  }
}

// Send message to client
function sendToClient(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data))
    } catch (error) {
      log("ERROR", "Error sending to client", { error: error.message, type: data.type })
    }
  }
}

// Send error message
function sendError(ws, message) {
  log("ERROR", `Sending error to client: ${message}`)
  sendToClient(ws, {
    type: "error",
    data: { message },
  })
}

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log("=".repeat(80))
  console.log(`🚀 Enhanced WebSocket Server v3.0 running on port ${PORT}`)
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API Base URL: ${API_BASE_URL}`)
  console.log(`⏰ Started: ${new Date().toLocaleString()}`)
  console.log("🔐 Features: Authentication, Product Ownership, Smart Routing, Typing Status, Message Status")
  console.log("=".repeat(80))
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...")

  clients.forEach((client, userId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close(1000, "Server shutting down")
    }
  })

  server.close(() => {
    console.log("✅ Server closed gracefully")
    process.exit(0)
  })

  setTimeout(() => {
    console.log("⚠️ Forcing server shutdown")
    process.exit(1)
  }, 5000)
})
