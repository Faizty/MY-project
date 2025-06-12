// Enhanced WebSocket Manager with Better Error Handling and Debugging
class WebSocketManager {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnecting = false
    this.messageQueue = []
    this.eventListeners = new Map()
    this.connectionPromise = null
    this.userId = null
    this.userRole = null
    this.userName = null
    this.authToken = null
    this.isConnected = false
  }

  // Enhanced connect method with auth token support
  connect(userId, userRole = "customer", userName = "Anonymous", authToken = null) {
    if (this.isConnecting || this.isConnected) {
      console.log("🔄 WebSocket already connecting or connected")
      return this.connectionPromise || Promise.resolve()
    }

    this.userId = userId
    this.userRole = userRole
    this.userName = userName
    this.authToken = authToken

    console.log("🔌 Connecting to WebSocket...", {
      userId,
      userRole,
      userName,
      hasToken: !!authToken,
      tokenPreview: authToken ? `${authToken.substring(0, 10)}...` : "none",
    })

    this.isConnecting = true

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with parameters including auth token
        const wsUrl = new URL("ws://localhost:3001")
        wsUrl.searchParams.set("userId", userId)
        wsUrl.searchParams.set("userRole", userRole)
        wsUrl.searchParams.set("userName", userName)

        // Add auth token to URL if provided (especially important for sellers)
        if (authToken) {
          wsUrl.searchParams.set("authToken", authToken)
        }

        console.log("🔗 WebSocket URL:", wsUrl.toString().replace(/authToken=[^&]+/, "authToken=***"))

        this.ws = new WebSocket(wsUrl.toString())

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket connection timeout")
            this.ws.close()
            this.handleConnectionFailure("Connection timeout")
            reject(new Error("Connection timeout"))
          }
        }, 10000)

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log("✅ WebSocket connected successfully")
          this.isConnecting = false
          this.isConnected = true
          this.reconnectAttempts = 0
          this.emit("connected", { userId, userRole, userName })
          this.processMessageQueue()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("📨 WebSocket message received:", data.type)
            this.emit(data.type, data.data)
          } catch (error) {
            console.error("❌ Error parsing WebSocket message:", error)
          }
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log("🔌 WebSocket connection closed:", event.code, event.reason)
          this.isConnecting = false
          this.isConnected = false
          this.emit("disconnected", { code: event.code, reason: event.reason })

          // Auto-reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error("❌ WebSocket error:", error)
          this.isConnecting = false
          this.isConnected = false
          this.emit("error", error)
          reject(error)
        }
      } catch (error) {
        console.error("❌ Error creating WebSocket connection:", error)
        this.isConnecting = false
        this.isConnected = false
        reject(error)
      }
    })

    return this.connectionPromise
  }

  // Handle connection failure
  handleConnectionFailure(reason) {
    this.isConnecting = false
    this.isConnected = false
    this.emit("error", reason)

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  // Enhanced reconnect method that preserves auth token
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached")
      this.emit("max_reconnect_attempts_reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    )

    setTimeout(() => {
      if (this.userId) {
        console.log("🔄 Attempting to reconnect...")
        this.emit("reconnecting", { attempt: this.reconnectAttempts })
        // Use stored credentials including auth token
        this.connect(this.userId, this.userRole, this.userName, this.authToken)
      }
    }, delay)
  }

  // Update auth token method
  updateAuthToken(newToken) {
    console.log("🔐 Updating auth token", {
      hasOldToken: !!this.authToken,
      hasNewToken: !!newToken,
      tokenChanged: this.authToken !== newToken,
    })

    this.authToken = newToken

    // If connected and token changed, reconnect to update server-side token
    if (this.isConnected && newToken && this.authToken !== newToken) {
      console.log("🔄 Reconnecting with new auth token...")
      this.disconnect()
      setTimeout(() => {
        this.connect(this.userId, this.userRole, this.userName, this.authToken)
      }, 100)
    }
  }

  sendMessage(type, data) {
    const message = { type, data }

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("📤 Sending WebSocket message:", type)
      try {
        this.ws.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error("❌ Error sending WebSocket message:", error)
        return false
      }
    } else {
      console.log("📦 Queueing message (WebSocket not ready):", type)
      this.messageQueue.push(message)

      // Try to connect if not connected
      if (!this.isConnecting && this.userId) {
        this.connect(this.userId, this.userRole, this.userName, this.authToken)
      }
      return false
    }
  }

  processMessageQueue() {
    console.log(`📦 Processing ${this.messageQueue.length} queued messages`)
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()
      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error("❌ Error sending queued message:", error)
        // Put message back at front of queue
        this.messageQueue.unshift(message)
        break
      }
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)

    // Return cleanup function
    return () => {
      this.off(event, callback)
    }
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  disconnect() {
    console.log("🔌 Disconnecting WebSocket...")
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect")
      this.ws = null
    }
    this.isConnecting = false
    this.isConnected = false
    this.connectionPromise = null
  }

  getConnectionState() {
    if (!this.ws) return "DISCONNECTED"

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING"
      case WebSocket.OPEN:
        return "CONNECTED"
      case WebSocket.CLOSING:
        return "CLOSING"
      case WebSocket.CLOSED:
        return "DISCONNECTED"
      default:
        return "UNKNOWN"
    }
  }

  getIsConnected() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN
  }

  // Ping method to test connection
  ping() {
    this.sendMessage("ping", { timestamp: new Date().toISOString() })
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager()

// Export both named and default
export { websocketManager }
export default websocketManager
