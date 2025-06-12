"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getCustomerOrders, updateOrderStatus } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Eye, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrders, setCancellingOrders] = useState(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    if (!isLoading && isAuthenticated && user?.role === "seller") {
      router.push("/seller/orders")
    }

    async function loadOrders() {
      if (!user?.id) return

      try {
        const data = await getCustomerOrders()
        console.log("📦 Customer orders loaded:", data)
        setOrders(data)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && user?.role === "customer") {
      loadOrders()
    }
  }, [isLoading, isAuthenticated, router, user])

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

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`)
  }

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrders((prev) => new Set(prev).add(orderId))

      await updateOrderStatus(orderId, "cancelled")

      // Update the order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)),
      )

      toast({
        title: "Order cancelled",
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
      setCancellingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-gray-600">View and track your order history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Button onClick={() => router.push("/products")}>Browse Products</Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <span className="font-medium text-gray-900">#{order.id}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-gray-600">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="col-span-2">{getStatusBadge(order.status)}</div>

                  <div className="col-span-2">
                    <span className="font-medium text-gray-900">${order.total_price.toFixed(2)}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-gray-600">
                      {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrders.has(order.id)}
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {cancellingOrders.has(order.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
