"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { getSellerOrders } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Package } from "lucide-react"

export default function SellerOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/seller/login")
    }

    async function loadSellerOrderItems() {
      if (!user?.id || !params.id) return

      try {
        // Get all seller order items
        const allOrderItems = await getSellerOrders(user.id)

        // Filter order items that match the order ID
        const orderItemsForThisOrder = allOrderItems.filter((item) => item.order_id.toString() === params.id.toString())

        if (orderItemsForThisOrder.length > 0) {
          setOrderItems(orderItemsForThisOrder)
        } else {
          console.error("No order items found for this order")
          router.push("/seller/orders")
        }
      } catch (error) {
        console.error("Error loading seller order items:", error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
        router.push("/seller/orders")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && user?.role === "seller") {
      loadSellerOrderItems()
    }
  }, [isLoading, isAuthenticated, router, user, params.id, toast])

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

  if (orderItems.length === 0) {
    return (
      <div className="container mx-auto max-w-[1200px] px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No order items found</h3>
          <p className="text-gray-500 mb-6">This order doesn't contain any of your products.</p>
          <Button onClick={() => router.push("/seller/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  // Get order info from first item (all items have same order info)
  const orderInfo = orderItems[0]
  const totalValue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/seller/orders")} className="flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{orderInfo.order_id}</h1>
            <p className="text-gray-600">Placed on {new Date(orderInfo.order_date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(orderInfo.order_status)}
            <div className="text-2xl font-bold mt-2">${totalValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Your Products in This Order</h2>
              <p className="text-sm text-gray-600">Products that belong to your store</p>
            </div>

            <div className="divide-y">
              {orderItems.map((item, index) => (
                <div key={`${item.order_id}-${item.product_id}-${index}`} className="p-6">
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
                      <p className="text-sm text-gray-500">Your product</p>
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
                <span>Your Products Total</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Count</span>
                <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Your Revenue</span>
                  <span>${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Customer Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Shipping Address:</span>
                <p className="font-medium">{orderInfo.customer_info?.shipping_address || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-600">Order Status:</span>
                <div className="mt-1">{getStatusBadge(orderInfo.order_status)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
