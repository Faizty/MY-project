"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useWebSocket } from "@/context/websocket-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, User, Package } from "lucide-react"

export default function ContactSellerForm({ sellerId, sellerName, productId, productName, onSuccess }) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { sendMessage, isConnected } = useWebSocket()
  const { user } = useAuth()
  const { toast } = useToast()

  console.log("📝 ContactSellerForm props:", {
    sellerId,
    sellerName,
    productId,
    productName,
    currentUser: user?.id,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to the seller.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      })
      return
    }

    if (!sellerId) {
      toast({
        title: "Seller Information Missing",
        description: "Unable to identify the seller. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Not connected to messaging service. Please check your connection.",
        variant: "destructive",
      })
      return
    }

    // Prevent sending message to yourself
    if (String(user.id) === String(sellerId)) {
      toast({
        title: "Invalid Action",
        description: "You cannot send a message to yourself.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)

      console.log("📤 Sending message with validated data:", {
        senderId: user.id,
        recipientId: sellerId,
        productId,
        productName,
        sellerName,
        messageLength: message.trim().length,
      })

      // Send message with explicit parameters
      const success = sendMessage(
        String(sellerId),
        message.trim(),
        String(productId),
        productName,
        sellerName,
      )

      if (success) {
        console.log("✅ Message sent successfully")
        setMessage("")

        if (onSuccess) {
          onSuccess()
        }

        toast({
          title: "Message Sent",
          description: `Your message has been sent to ${sellerName}.`,
        })
      } else {
        console.error("❌ Failed to send message")
        toast({
          title: "Send Failed",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!sellerId) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-md">
        <p className="font-medium">Seller information is missing</p>
        <p className="text-sm">Unable to send message. Please refresh the page and try again.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seller and Product Information Display */}
      <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">To:</span>
          <span>
            {sellerName} (ID: {sellerId})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-medium">About:</span>
          <span>
            {productName} (ID: {productId})
          </span>
        </div>
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Your Message
        </label>
        <Textarea
          id="message"
          placeholder="Type your message to the seller here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={500}
          required
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{message.length}/500 characters</span>
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSending || !message.trim() || !isConnected} className="min-w-[120px]">
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
