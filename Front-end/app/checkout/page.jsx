"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { createOrder, updateOrderStatus, processOrderPayment, getCurrentUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react"

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [userData, setUserData] = useState(null)

  // Calculate subtotal with discounts applied
  const subtotal = cart.reduce((total, item) => {
    const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
    return total + discountedPrice * item.quantity
  }, 0)

  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.07
  const total = subtotal + shipping + tax

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue with your purchase.",
        variant: "destructive",
      })
      router.push("/login?checkout=true")
    }

    // Redirect to cart if cart is empty
    if (!isLoading && cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some products before checkout.",
      })
      router.push("/cart")
    }

    // Fetch user data for payment processing
    if (isAuthenticated && !userData) {
      getCurrentUser().then(setUserData).catch(console.error)
    }
  }, [isLoading, isAuthenticated, cart, router, toast, userData])

  const handlePlaceOrder = async (orderStatus = "pending") => {
    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your shipping address.",
        variant: "destructive",
      })
      return
    }

    if (!userData) {
      toast({
        title: "User Data Missing",
        description: "Unable to fetch user information. Please try again.",
        variant: "destructive",
      })
      return
    }

    const isPlacing = orderStatus === "pending"
    if (isPlacing) {
      setIsPlacingOrder(true)
    } else {
      setIsBuyingNow(true)
    }

    try {
      // Calculate the correct totals and item prices with discounts applied
      const orderItemsWithDiscountedPrices = cart.map((item) => {
        const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
        return {
          product_id: item.id,
          quantity: item.quantity,
          price: discountedPrice,
          originalPrice: item.price,
          discount: item.discount || 0,
        }
      })

      // Calculate subtotal using the discounted prices
      const subtotalWithDiscounts = orderItemsWithDiscountedPrices.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)

      const shippingCost = subtotalWithDiscounts > 100 ? 0 : 10
      const taxAmount = subtotalWithDiscounts * 0.07
      const finalTotalWithDiscountsAndTax = subtotalWithDiscounts + shippingCost + taxAmount

      // Prepare order data
      const orderData = {
        shipping_address: shippingAddress.trim(),
        payment_method: paymentMethod,
        total_amount: finalTotalWithDiscountsAndTax,
        items: orderItemsWithDiscountedPrices.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      console.log("📦 Creating order with data:", orderData)

      // Create the order first
      const createdOrder = await createOrder(orderData)
      console.log("📦 Order created successfully:", createdOrder)

      // If buying now, process payment with Chapa
      if (orderStatus === "sold") {
        console.log("💳 Processing payment for immediate purchase...")

        try {
          // Process payment with Chapa
          const paymentResponse = await processOrderPayment(
            {
              orderId: createdOrder.id,
              total_amount: finalTotalWithDiscountsAndTax,
            },
            userData,
          )

          console.log("💳 Payment response:", paymentResponse)

          // Check if payment was initialized successfully
          if (paymentResponse.status === "success" && paymentResponse.checkout_url) {
            // Update order status to sold since payment was initialized successfully
            await updateOrderStatus(createdOrder.id, "sold")

            // Clear the cart before redirecting to payment
            clearCart()

            // Show success message
            toast({
              title: "Redirecting to Payment",
              description: "You will be redirected to complete your payment.",
            })

            // Redirect to Chapa checkout URL
            window.location.href = paymentResponse.checkout_url
            return
          } else {
            // Payment initialization failed - keep order as pending
            console.log("💳 Payment initialization failed, keeping order as pending")

            toast({
              title: "Payment Initialization Failed",
              description: "Payment could not be initialized. Order saved as pending.",
              variant: "destructive",
            })

            // Clear cart and redirect to orders page with pending order
            clearCart()
            router.push("/orders")
            return
          }
        } catch (paymentError) {
          console.error("💳 Payment processing error:", paymentError)

          // Keep order as pending if payment fails
          console.log("💳 Payment error occurred, keeping order as pending")

          toast({
            title: "Payment Failed",
            description: "Payment could not be processed. Order saved as pending.",
            variant: "destructive",
          })

          // Still redirect to orders page to show the pending order
          clearCart()
          router.push("/orders")
          return
        }
      } else {
        // For pending orders, just show success
        console.log("📦 Order placed as pending")
      }

      // Clear the cart
      clearCart()

      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${createdOrder.id} has been placed successfully.`,
      })

      // Redirect to orders page
      router.push("/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
      setIsBuyingNow(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-2xl font-medium">Your cart is empty</h2>
        <p className="mb-6 text-gray-600">Add some products to your cart before checkout.</p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/cart")} className="flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-gray-600">Complete your order details</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {/* Shipping Address */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Full Address *</Label>
                  <Input
                    id="shippingAddress"
                    placeholder="Enter your complete shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="min-h-[80px]"
                  />
                  <p className="text-sm text-gray-500">Include street address, city, state, and postal code</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex-1 cursor-pointer font-normal">
                    Credit / Debit Card (via Chapa)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex-1 cursor-pointer font-normal">
                    Mobile Money (via Chapa)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer font-normal">
                    Bank Transfer (via Chapa)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Order Actions */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Complete Your Order</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button
                    onClick={() => handlePlaceOrder("pending")}
                    disabled={isPlacingOrder || isBuyingNow}
                    variant="outline"
                    className="w-full"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order (Pending)"
                    )}
                  </Button>

                  <Button
                    onClick={() => handlePlaceOrder("sold")}
                    disabled={isPlacingOrder || isBuyingNow}
                    className="w-full"
                  >
                    {isBuyingNow ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      "Pay Now with Chapa"
                    )}
                  </Button>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Place Order:</strong> Order will be pending until seller approval
                  </p>
                  <p>
                    <strong>Pay Now:</strong> Complete payment immediately via Chapa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-20 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

            <div className="mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => {
                const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
                const itemTotal = discountedPrice * item.quantity

                return (
                  <div key={item.id} className="mb-3 flex items-center gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {item.discount > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 line-through">${item.price.toFixed(2)}</span>
                          <span className="text-green-600 font-medium">{item.discount}% off</span>
                        </div>
                      )}
                      <p className="text-sm font-medium">${itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal (with discounts)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Secure payment powered by Chapa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
