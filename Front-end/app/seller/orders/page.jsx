"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { getSellerOrders, updateOrderStatus } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Package, Clock, CheckCircle, XCircle, Search, ArrowUpDown, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function SellerOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    if (!isLoading && isAuthenticated && user?.role !== "seller") {
      router.push("/profile")
    }

    // Check if there's a status parameter in the URL
    const statusParam = searchParams.get("status")
    if (statusParam && ["all", "pending", "sold", "cancelled"].includes(statusParam)) {
      setActiveTab(statusParam)
    }

    async function loadOrders() {
      if (!user?.id) return

      try {
        const data = await getSellerOrders(user.id)
        console.log("📦 Seller order items loaded:", data)
        setOrderItems(data)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && user?.role === "seller") {
      loadOrders()
    }
  }, [isLoading, isAuthenticated, router, user, searchParams])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      setOrderItems(
        orderItems.map((item) => {
          if (item.order_id === orderId) {
            return { ...item, order_status: newStatus }
          }
          return item
        }),
      )

      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: `Failed to update order status. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Group order items by order_id to create orders
  const groupedOrders = orderItems.reduce((acc, item) => {
    const orderId = item.order_id
    if (!acc[orderId]) {
      acc[orderId] = {
        order_id: orderId,
        order_status: item.order_status,
        order_date: item.order_date,
        customer_info: item.customer_info,
        items: [],
        total_amount: 0,
      }
    }
    acc[orderId].items.push(item)
    acc[orderId].total_amount += item.price * item.quantity
    return acc
  }, {})

  const orders = Object.values(groupedOrders)

  // Filter orders based on tab and search query
  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === "all") return true
      return order.order_status === activeTab
    })
    .filter((order) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        order.order_id.toString().includes(query) ||
        order.items.some((item) => item.name?.toLowerCase().includes(query)) ||
        order.customer_info?.shipping_address?.toLowerCase().includes(query)
      )
    })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.order_date) - new Date(a.order_date)
      case "oldest":
        return new Date(a.order_date) - new Date(b.order_date)
      case "highest":
        return b.total_amount - a.total_amount
      case "lowest":
        return a.total_amount - b.total_amount
      default:
        return 0
    }
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "sold":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Sold
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </Badge>
        )
    }
  }

  // Count orders by status
  const pendingCount = orders.filter((order) => order.order_status === "pending").length
  const soldCount = orders.filter((order) => order.order_status === "sold").length
  const cancelledCount = orders.filter((order) => order.order_status === "cancelled").length

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <p className="text-gray-600">View and process customer orders</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({soldCount})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledCount})</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="highest">Highest value</SelectItem>
                <SelectItem value="lowest">Lowest value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "No orders match your search criteria."
                  : activeTab === "all"
                    ? "You don't have any orders yet."
                    : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="border rounded-lg overflow-hidden bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="border-b bg-gray-50 p-4 flex flex-wrap justify-between items-center gap-4 dark:bg-gray-700 dark:border-gray-600">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium dark:text-white">Order #{order.order_id}</span>
                        {getStatusBadge(order.order_status)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                        <span>Placed on {new Date(order.order_date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg dark:text-white">${order.total_amount.toFixed(2)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-200"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message Customer
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.order_id}-${item.product_id}-${index}`}
                          className="flex items-center gap-4 py-3"
                        >
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
                            <h4 className="font-medium dark:text-white">{item.name}</h4>
                            <div className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                              Product ID: {item.product_id}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="font-medium dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Shipping: {order.customer_info?.shipping_address || "N/A"}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/seller/orders/${order.order_id}`)}
                          className="dark:border-gray-600 dark:text-gray-200"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
