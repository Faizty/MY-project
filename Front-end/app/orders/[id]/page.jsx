"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { getCustomerOrders, updateOrderStatus, processOrderPayment } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    async function loadOrderDetail() {
      if (!user?.id || !params.id) return

      try {
        const orders = await getCustomerOrders()
        const foundOrder = orders.find((o) => o.id.toString() === params.id.toString())

        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          console.error("Order not found")
          router.push("/orders")
        }
      } catch (error) {
        console.error("Error loading order detail:", error)
        router.push("/orders")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && user?.role === "customer") {
      loadOrderDetail()
    }
  }, [isLoading, isAuthenticated, router, user, params.id])

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "sold":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sold</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Order not found</h3>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  const handleBuyNow = async () => {
    if (!order?.id || !user) return

    setUpdatingStatus(true)
    try {
      console.log("💳 Processing order payment for order:", order.id)

      // Process payment with Chapa
      const paymentResponse = await processOrderPayment(
        {
          orderId: order.id,
          total_amount: order.total_price,
        },
        user,
      )

      console.log("💳 Payment response:", paymentResponse)

      // Check if payment initialization was successful
      if (paymentResponse.status === "success" && paymentResponse.checkout_url) {
        // Update order status to sold only if payment was initialized successfully
        await updateOrderStatus(order.id, "sold")

        // Update local state
        setOrder({
          ...order,
          status: "sold",
        })

        toast({
          title: "Payment Initialized!",
          description: "Redirecting to payment gateway...",
        })

        // Redirect to Chapa checkout page
        window.location.href = paymentResponse.checkout_url
      } else {
        // Payment initialization failed - keep order as pending
        console.log("💳 Payment initialization failed, order remains pending")

        toast({
          title: "Payment Initialization Failed",
          description: "Payment could not be initialized. Order remains pending.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💳 Error processing payment:", error)

      // Keep order as pending if payment processing fails
      console.log("💳 Payment error occurred, order remains pending")

      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Order remains pending.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/orders")} className="flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(order.status)}
            <div className="text-2xl font-bold mt-2">${order.total_price.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>

            <div className="divide-y">
              {order.order_items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 relative flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg?height=80&width=80"}
                        alt={item.name || "Product"}
                        fill
                        className="object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 mt-1">Product ID: {item.product_id}</p>
                      <p className="text-gray-600">Seller ID: {item.seller_id}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.total_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Buy Now Button - Only show if status is pending */}
            {order.status === "pending" && (
              <div className="mt-6 pt-4 border-t">
                <Button onClick={handleBuyNow} disabled={updatingStatus} className="w-full" size="lg">
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Complete your purchase and update order status to sold
                </p>
              </div>
            )}

            {/* Add Cancel Order button for pending orders */}
            {order.status === "pending" && (
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    setUpdatingStatus(true)
                    try {
                      await updateOrderStatus(order.id, "cancelled")

                      // Update local state
                      setOrder({
                        ...order,
                        status: "cancelled",
                      })

                      toast({
                        title: "Order Cancelled",
                        description: "Your order has been successfully cancelled.",
                      })
                    } catch (error) {
                      console.error("Error cancelling order:", error)
                      toast({
                        title: "Error",
                        description: "Failed to cancel order. Please try again.",
                        variant: "destructive",
                      })
                    } finally {
                      setUpdatingStatus(false)
                    }
                  }}
                  disabled={updatingStatus}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-medium">{order.shipping_address}</p>
              </div>
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-medium capitalize">{order.payment_method.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
