"use client"

import { useState, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, Minus, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { calculateDiscountedPrice } from "@/lib/price-utils"

// Use memo to prevent unnecessary re-renders
const ProductCard = memo(({ product }) => {
  const { id, name, description, price, discount, image, rating, reviews } = product
  const { addToCart, cart } = useCart()
  const { isInWishlist, toggleWishlistItem } = useWishlist()
  const { toast } = useToast()
  const [showQuickView, setShowQuickView] = useState(false)
  const inWishlist = isInWishlist(product.id)
  const [quantity, setQuantity] = useState(1)

  // Calculate discounted price from original price and discount
  const discountedPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if item already exists in cart
    const existingItem = cart.find(
      (item) => String(item.id) === String(product.id) || Number(item.id) === Number(product.id),
    )

    if (existingItem) {
      toast({
        title: "Item already in cart",
        description: `${product.name} is already in your cart. Please update the quantity in your cart page.`,
        variant: "destructive",
      })
      return
    }

    addToCart({ ...product, quantity: quantity, price: discountedPrice, seller: product.seller })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlistItem(product.id)
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950 max-w-full w-full">
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 z-10 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
            {discount}%
          </Badge>
        )}
        <div className="relative aspect-square overflow-hidden">
          <Link href={`/products/${id}`}>
            <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-105">
              <Image
                src={image || "/placeholder.svg"}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </Link>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="transform scale-90 transition-transform hover:scale-100"
              onClick={handleQuickView}
            >
              Quick View
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <Link href={`/products/${id}`}>
            <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2 dark:text-white">{name}</h3>
          </Link>
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 font-medium">{product.brand}</p>
          <p className="mb-1 line-clamp-2 flex-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          <div className="mb-1 flex items-center">
            <div className="flex items-center">
              <Star className="mr-1 h-3 w-3 fill-current text-yellow-500" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{reviews}</span>
          </div>
          <div className="mb-2 flex items-center">
            <span className="text-base font-bold text-gray-900 dark:text-white">${discountedPrice.toFixed(2)}</span>
            {discount > 0 && (
              <span className="ml-2 text-xs text-gray-500 line-through dark:text-gray-400">${price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button size="sm" variant="outline" className="px-2" onClick={handleToggleWishlist}>
              <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
          <DialogContent
            className="sm:max-w-5xl p-0 overflow-hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50"
            overlayClassName="fixed inset-0 bg-black/50 z-40"
          >
            <div className="flex flex-col md:flex-row max-h-[95vh] overflow-auto">
              {/* Image Section */}
              <div className="w-full md:w-1/2 p-6 bg-gray-50 dark:bg-gray-900">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                  <Image src={product.image || "/placeholder.svg"} alt={name} fill className="object-cover" priority />
                </div>

                {/* Thumbnails - if product has multiple images */}
                {product.images && product.images.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-auto pb-2">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-16 w-16 flex-shrink-0 cursor-pointer rounded border-2 border-transparent hover:border-primary"
                      >
                        <div className="relative h-full w-full overflow-hidden rounded">
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`${product.name} thumbnail ${idx}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 p-6">
                <DialogTitle className="text-2xl font-bold mb-2">{product.name}</DialogTitle>

                <div className="flex items-center gap-2 mt-1">
                  {renderStars(product.rating || 0)}
                  <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>
                </div>

                <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white flex items-baseline">
                  ${discountedPrice.toFixed(2)}
                  {discount > 0 && (
                    <span className="ml-3 text-lg text-gray-500 line-through dark:text-gray-400">
                      ${price.toFixed(2)}
                    </span>
                  )}
                  {discount > 0 && <Badge className="ml-3 bg-red-500 text-white">Save {discount}%</Badge>}
                </div>

                <div className="mt-2 text-green-600 font-medium">{product.stock > 0 ? "In stock" : "Out of stock"}</div>

                <Separator className="my-4" />

                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  {product.description}
                </DialogDescription>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">2-year warranty</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      // Check if item already exists in cart
                      const existingItem = cart.find(
                        (item) => String(item.id) === String(product.id) || Number(item.id) === Number(product.id),
                      )

                      if (existingItem) {
                        toast({
                          title: "Item already in cart",
                          description: `${product.name} is already in your cart. Please update the quantity in your cart page.`,
                          variant: "destructive",
                        })
                        return
                      }

                      addToCart({ ...product, quantity: quantity, price: discountedPrice, seller: product.seller })
                      toast({
                        title: "Added to cart",
                        description: `${product.name} has been added to your cart`,
                      })
                    }}
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to cart
                  </Button>

                  <Button variant="outline" size="icon" onClick={handleToggleWishlist}>
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>

                <div className="mt-4">
                  <Link href={`/products/${product.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View full details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
})

ProductCard.displayName = "ProductCard"

export default ProductCard
