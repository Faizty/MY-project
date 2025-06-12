"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
/* import { getProductSeller, validateProductOwnership } from "@/lib/api" */
import ContactSellerForm from "@/components/messaging/contact-seller-form"

export function ContactSellerModal({ product }) {
  const [isOpen, setIsOpen] = useState(false)
  const [sellerInfo, setSellerInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Fetch fresh seller information when modal opens
  useEffect(() => {
    if (isOpen && product?.id) {
      fetchSellerInfo()
    }
  }, [isOpen, product?.id])

  const fetchSellerInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching fresh seller info for product:", product.id)

      // Get fresh seller information
      const seller = await getProductSeller(product.id)

      // Validate that this seller actually owns the product
      const isValidOwner = await validateProductOwnership(product.id, seller.id)

      if (!isValidOwner) {
        throw new Error("Seller ownership validation failed")
      }

      console.log("✅ Seller info validated:", seller)

      setSellerInfo({
        id: seller.id,
        name: seller.name || "Unknown Seller",
      })
    } catch (error) {
      console.error("❌ Error fetching seller info:", error)
      setError(error.message)

      // Fallback to product data
      const fallbackSeller = {
        id: product.seller_id || product.sellerId || product.seller?.id,
        name: product.seller_name || product.sellerName || product.seller?.name || "Unknown Seller",
      }

      if (fallbackSeller.id) {
        console.log("🔄 Using fallback seller info:", fallbackSeller)
        setSellerInfo(fallbackSeller)
        setError(null)
      } else {
        setError("Unable to identify the seller for this product")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    if (!product) {
      toast({
        title: "Error",
        description: "Product information is missing.",
        variant: "destructive",
      })
      return
    }

    setIsOpen(true)
  }

  if (!product) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-2" onClick={handleOpenModal}>
          <MessageSquare className="h-4 w-4" />
          Contact Seller
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Seller about {product.name}</DialogTitle>
          <DialogDescription>
            Send a message to the seller about this product. They typically respond within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading seller information...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading seller information</p>
                <p className="text-sm">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={fetchSellerInfo}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {sellerInfo && !loading && !error && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">Seller: {sellerInfo.name}</p>
                <p className="text-xs text-blue-700">Seller ID: {sellerInfo.id}</p>
                <p className="text-xs text-blue-700">
                  Product: {product.name} (ID: {product.id})
                </p>
              </div>

              <ContactSellerForm
                sellerId={sellerInfo.id}
                sellerName={sellerInfo.name}
                productId={product.id}
                productName={product.name}
                onSuccess={() => {
                  toast({
                    title: "Message Sent",
                    description: "Your message has been sent to the seller.",
                  })
                  setIsOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ContactSellerModal
