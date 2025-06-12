"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { getSellerProducts, deleteProduct, getSellerOrders, getUserAvatar } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import SellerProductCard from "@/components/seller/seller-product-card"
import SellerStats from "@/components/seller/seller-stats"
import SellerMessages from "@/components/seller/seller-messages"
import {
  Plus,
  Loader2,
  Package,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/seller/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const data = await getSellerProducts(user.id)
          setProducts(data)
        } catch (error) {
          console.error("Error fetching products:", error)
          toast({
            title: "Error",
            description: "Failed to load your products. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingProducts(false)
        }
      }
    }

    const fetchOrders = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const data = await getSellerOrders(user.id)
          setOrders(data)
        } catch (error) {
          console.error("Error fetching orders:", error)
          toast({
            title: "Error",
            description: "Failed to load your orders. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingOrders(false)
        }
      }
    }

    if (isAuthenticated && user?.id) {
      fetchProducts()
      fetchOrders()
    }
  }, [isAuthenticated, user, toast])

  const fetchUserAvatar = async () => {
    if (!user?.id) return

    try {
      const response = await getUserAvatar(user.id)
      if (response.success && response.avatarData) {
        // Convert binary data to base64 URL
        const base64 = btoa(
          new Uint8Array(response.avatarData).reduce((data, byte) => data + String.fromCharCode(byte), ""),
        )
        const avatarDataUrl = `data:image/jpeg;base64,${base64}`
        setAvatarUrl(avatarDataUrl)
      }
    } catch (error) {
      console.error("Error fetching avatar:", error)
      // If avatar fetch fails, it's not critical - user just won't see existing avatar
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchUserAvatar()
    } else {
      setAvatarUrl("")
    }
  }, [user?.id])

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      setProducts(products.filter((product) => product.id !== productId))
      toast({
        title: "Product deleted",
        description: "Your product has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

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
    router.push(`/seller/orders/${orderId}`)
  }

  // Calculate today's sales
  const calculateTodaysSales = () => {
    if (!orders || orders.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return orders
      .filter((order) => {
        const orderDate = new Date(order.order_date)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === today.getTime()
      })
      .reduce((total, order) => total + order.price * order.quantity, 0)
  }

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    if (!orders || orders.length === 0) return 0
    return orders.filter((order) => order.order_status === "sold").reduce((total, order) => total + order.price * order.quantity, 0)
  }

  // Count sold products
  const countSoldProducts = () => {
    if (!orders || orders.length === 0) return 0
    return orders.filter((order) => order.order_status === "sold").reduce((total, order) => total + order.quantity, 0)
  }

  // Count total orders
  const countTotalOrders = () => {
    if (!orders || orders.length === 0) return 0
    const uniqueOrderIds = [...new Set(orders.map((order) => order.order_id))]
    return uniqueOrderIds.length
  }

  // Count unique customers
  const countUniqueCustomers = () => {
    if (!orders || orders.length === 0) return 0
    const uniqueCustomerIds = [...new Set(orders.map((order) => order.user_id))]
    return uniqueCustomerIds.length
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
            <Image
              src={avatarUrl || "/placeholder.svg?height=64&width=64&text=DS"}
              alt={user?.name || "Seller"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name || "Seller"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/seller/products/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300"
          >
            <Settings className="h-4 w-4" />
            Profile Settings
          </Button>
        </div>
      </div>

      <div className="mb-6 sm:mb-8 grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-stat-card bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">Today's Sales</p>
              <h3 className="mt-1 text-2xl font-bold text-primary dark:text-primary-foreground">
                ${calculateTodaysSales().toFixed(2)}
              </h3>
              <p className="mt-1 flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% from yesterday
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3 dark:bg-primary/30">
              <DollarSign className="h-6 w-6 text-primary dark:text-primary-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">Pending Orders</p>
              <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {orders.filter((order) => order.order_status === "pending").length}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">Requires your attention</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3 dark:bg-amber-500/30">
              <ShoppingBag className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">Unread Messages</p>
              <h3 className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">5</h3>
              <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">From 3 different customers</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3 dark:bg-blue-500/30">
              <MessageSquare className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-stat-card bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">Total Products</p>
              <h3 className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{products.length}</h3>
              <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">Across 6 categories</p>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3 dark:bg-purple-500/30">
              <Package className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 sm:mt-8">
        <TabsList className="mb-6 sm:mb-8 grid w-full grid-cols-3 sm:grid-cols-4 gap-1 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SellerStats
            calculateTotalRevenue={calculateTotalRevenue}
            countSoldProducts={countSoldProducts}
            countTotalOrders={countTotalOrders}
            countUniqueCustomers={countUniqueCustomers}
          />

          <div className="mt-8 grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your most recent customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={`${order.order_id}-${order.product_id}`}
                        className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-2 dark:bg-primary/20">
                            <ShoppingBag className="h-5 w-5 text-primary dark:text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">Order #{order.order_id}</p>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                              {order.quantity} items • ${(order.price * order.quantity).toFixed(2)}
                            </p>
                            <div className="mt-1">{getStatusBadge(order.order_status)}</div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:border-gray-600 dark:text-gray-300"
                          onClick={() => handleViewOrder(order.order_id)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          {isLoadingProducts ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center dark:border-gray-700">
              <h3 className="mb-2 text-xl font-semibold dark:text-white">No products yet</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">Start selling by adding your first product.</p>
              <Button onClick={() => router.push("/seller/products/new")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <SellerProductCard key={product.id} product={product} onDelete={handleDeleteProduct} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <SellerMessages />
        </TabsContent>

        <TabsContent value="orders">
          <div className="rounded-lg border p-6 dark:border-gray-700">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Recent Orders</h2>
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300"
                onClick={() => router.push("/seller/orders")}
              >
                View All Orders
              </Button>
            </div>

            {isLoadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here when customers purchase your products.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
                    <div className="col-span-2">Order ID</div>
                    <div className="col-span-3">Product</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                </div>

                <div className="divide-y">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={`${order.order_id}-${order.product_id}`}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <span className="font-medium text-gray-900">#{order.order_id}</span>
                        </div>

                        <div className="col-span-3">
                          <div className="h-10 w-10 relative flex-shrink-0">
                            <Image
                              src={order.image || "/placeholder.svg?height=40&width=40"}
                              alt={order.product?.name || "Product"}
                              fill
                              className="object-cover rounded"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate">{order.product?.name || "Product"}</p>
                            <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <span className="text-gray-600">{new Date(order.order_date).toLocaleDateString()}</span>
                        </div>

                        <div className="col-span-2">{getStatusBadge(order.order_status)}</div>

                        <div className="col-span-2">
                          <span className="font-medium text-gray-900">
                            ${(order.price * order.quantity).toFixed(2)}
                          </span>
                        </div>

                        <div className="col-span-1 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="dark:text-gray-300 dark:hover:bg-gray-800"
                            onClick={() => handleViewOrder(order.order_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
