"use client"

import { useState } from "react"
import { useWebSocket } from "@/context/websocket-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"

export function ContactForm({ recipientId, recipientName, productId, productName, onMessageSent }) {
  const { user } = useAuth()
  const { sendMessage, isConnected } = useWebSocket()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to send messages.",
        variant: "destructive",
      })
      return
    }

    if (!recipientId) {
      toast({
        title: "Error",
        description: "Recipient information is missing. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!productId) {
      toast({
        title: "Error",
        description: "Product information is missing. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Create conversation ID using sorted user IDs and product ID for consistency
      const participants = [user.id, recipientId].sort()
      const conversationId = `conv_${participants[0]}_${participants[1]}_${productId}`

      console.log("[ContactForm] Sending message:", {
        conversationId,
        senderId: user.id,
        senderName: user.name,
        recipientId,
        recipientName,
        productId,
        productName,
        message: message.trim(),
      })

      const success = sendMessage({
        conversationId,
        recipientId,
        recipientName,
        productId,
        productName,
        message: message.trim(),
      })

      if (success) {
        setMessage("")
        toast({
          title: "Message sent",
          description: `Your message about "${productName}" has been sent to ${recipientName}.`,
        })

        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        toast({
          title: "Failed to send",
          description: "Your message could not be sent. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "An error occurred while sending your message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <div>
          Contacting: <span className="font-medium">{recipientName}</span>
        </div>
        <div>
          About: <span className="font-medium">{productName}</span>
        </div>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Ask ${recipientName} about "${productName}"...`}
        className="min-h-[100px]"
        required
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isConnected ? (
            <span className="text-green-500">Connected to messaging service</span>
          ) : (
            <span className="text-amber-500">Not connected to messaging service</span>
          )}
        </div>

        <Button type="submit" disabled={isSending || !message.trim() || !isConnected || !recipientId || !productId}>
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
