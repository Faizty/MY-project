"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react"

export default function PaymentPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [saveCard, setSaveCard] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  // Calculate order summary
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
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
    if (!isLoading && cart.length === 0 && !isSuccess) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some products before checkout.",
      })
      router.push("/cart")
    }
  }, [isLoading, isAuthenticated, cart, router, toast, isSuccess])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBillingAddress({
      ...billingAddress,
      [name]: value,
    })
  }

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      clearCart()

      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully.",
      })
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-lg border bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
            <p className="mb-6 text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
            <div className="mb-8 w-full max-w-md rounded-lg border bg-gray-50 p-4">
              <p className="mb-2 font-medium">Order Reference: #ORD-{Math.floor(Math.random() * 10000)}</p>
              <p className="text-sm text-gray-600">A confirmation email has been sent to your email address.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/orders")}>View Orders</Button>
              <Button variant="outline" onClick={() => router.push("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-gray-600">Complete your purchase by providing payment details</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Billing Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={billingAddress.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={billingAddress.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={billingAddress.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={billingAddress.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" name="state" value={billingAddress.state} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={billingAddress.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    name="country"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={billingAddress.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-4">
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex-1 cursor-pointer font-normal">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span>Credit / Debit Card</span>
                    </div>
                  </Label>
                  <div className="flex gap-2">
                    <Image
                      src="/placeholder.svg?height=24&width=36&text=VISA"
                      alt="Visa"
                      width={36}
                      height={24}
                      className="rounded"
                    />
                    <Image
                      src="/placeholder.svg?height=24&width=36&text=MC"
                      alt="Mastercard"
                      width={36}
                      height={24}
                      className="rounded"
                    />
                    <Image
                      src="/placeholder.svg?height=24&width=36&text=AMEX"
                      alt="American Express"
                      width={36}
                      height={24}
                      className="rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer font-normal">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/placeholder.svg?height=20&width=20&text=P"
                        alt="PayPal"
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      <span>PayPal</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="saveCard" checked={saveCard} onCheckedChange={setSaveCard} />
                    <Label htmlFor="saveCard" className="text-sm font-normal">
                      Save card for future purchases
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </Button>
          </form>
        </div>

        <div>
          <div className="sticky top-20 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="mb-3 flex items-center gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
