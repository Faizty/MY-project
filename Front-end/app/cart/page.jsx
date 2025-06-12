"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { isAuthenticated } = useAuth()
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
    return total + itemPrice * item.quantity
  }, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.07
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    setIsCheckingOut(true)

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue with your purchase.",
      })
      router.push("/login?checkout=true")
      setIsCheckingOut(false)
      return
    }

    // Proceed to payment page
    router.push("/checkout")
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
        <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-2xl font-medium">Your cart is empty</h2>
        <p className="mb-6 text-gray-600">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/products">
          <Button className="bg-brand-600 hover:bg-brand-700">Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium">Your Cart</h1>
        {isLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating cart...
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="border-b bg-gray-50 p-4">
              <div className="grid grid-cols-12 gap-4 font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
            </div>

            {cart.map((item) => {
              const itemPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
              return (
                <div key={item.id} className="border-b p-4 last:border-0">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.selectedColor && <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>}
                        {item.discount > 0 && <p className="text-sm text-green-600">{item.discount}% off</p>}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-1 flex items-center text-sm text-red-500 hover:text-red-700"
                          disabled={isLoading}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">${itemPrice.toFixed(2)}</span>
                        {item.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">${item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="mx-auto flex w-24 items-center rounded-md border">
                        <button
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={isLoading || item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="flex-1 text-center">{item.quantity}</span>
                        <button
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-medium">${(itemPrice * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-medium">Order Summary</h2>
          <div className="space-y-3 border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button
            className="mt-6 w-full bg-brand-600 hover:bg-brand-700"
            onClick={handleCheckout}
            disabled={isCheckingOut || isLoading}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </Button>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Secure checkout powered by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  )
}
