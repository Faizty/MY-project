"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { getProductById } from "@/lib/api"
import { calculateDiscountedPrice } from "@/lib/price-utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Share2,
} from "lucide-react"
import ProductReviews from "@/components/products/product-reviews"
import RelatedProducts from "@/components/products/related-products"
import ImageZoom from "@/components/products/image-zoom"
import ContactSellerModal from "@/components/products/contact-seller-modal"

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showContactModal, setShowContactModal] = useState(false)

  const { addToCart, cart } = useCart()
  const { isInWishlist, toggleWishlistItem } = useWishlist()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      try {
        const data = await getProductById(id)
        if (data) {
          setProduct(data)
          setSelectedImage(0) 
        } else {
          console.error("Product not found")
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (product) {
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

      addToCart({
        ...product,
        quantity,
        price: discountedPrice,
        seller: product.seller,
      })
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      })
    }
  }

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlistItem(product.id)
      toast({
        title: isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist(product.id)
          ? `${product.name} has been removed from your wishlist`
          : `${product.name} has been added to your wishlist`,
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-8 h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="mt-8 h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <h2 className="text-lg font-semibold">Product Not Found</h2>
          <p className="mt-2">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products">
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate discounted price from original price and discount
  const discountedPrice =
    product.discount > 0 ? calculateDiscountedPrice(product.price, product.discount) : product.price

  // Add error boundary for product images
  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg?text=Image+Not+Found"
  }

  return (
    <div className="container max-w-[1600px] mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-primary dark:hover:text-brand-400">
          Home
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <Link href="/products" className="hover:text-primary dark:hover:text-brand-400">
          Products
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <Link href={`/products?category=${product.category}`} className="hover:text-primary dark:hover:text-brand-400">
          {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            {product.discount > 0 && (
              <Badge className="absolute left-4 top-4 z-10 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                {product.discount}% OFF
              </Badge>
            )}
            <ImageZoom src={product.images?.[selectedImage] || "/placeholder.svg"} alt={product.name} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square overflow-hidden rounded border ${
                  selectedImage === index
                    ? "border-primary ring-2 ring-primary/20 dark:border-brand-400 dark:ring-brand-400/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                  className="object-cover"
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{product.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{product.brand}</p>

          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-current text-yellow-500" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="mx-2 text-gray-400">•</span>
            <Link
              href="#reviews"
              className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-brand-400"
            >
              {product.reviews} reviews
            </Link>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-green-600 dark:text-green-400">In Stock ({product.stock} available)</span>
          </div>

          <div className="mt-4 flex items-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">${discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="ml-3 text-lg text-gray-500 line-through dark:text-gray-400">
                ${product.price.toFixed(2)}
              </span>
            )}
            {product.discount > 0 && (
              <Badge className="ml-3 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                Save {product.discount}%
              </Badge>
            )}
          </div>

          <p className="mt-6 text-gray-600 dark:text-gray-300">{product.fullDescription}</p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center">
              <Truck className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">2-year warranty included</span>
            </div>
            <div className="flex items-center">
              <RotateCcw className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">30-day money-back guarantee</span>
            </div>
          </div>

          <Separator className="my-6 dark:bg-gray-800" />

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:disabled:text-gray-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 dark:text-gray-400 dark:hover:bg-gray-800 dark:disabled:text-gray-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="flex-1 gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`dark:border-gray-800 ${isInWishlist(product.id) ? "text-red-500 hover:text-red-600" : ""}`}
              onClick={handleToggleWishlist}
              title="Add to Wishlist"
            >
              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="dark:border-gray-800"
              onClick={() => window.history.back()}
              title="Back to Search"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="icon" className="dark:border-gray-800">
              <Share2 className="h-4 w-4" />
            </Button>
            <ContactSellerModal product={product} />
          </div>

          <Separator className="my-6 dark:bg-gray-800" />

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2 font-medium">Sold by:</span>
            <Link href="#" className="hover:text-primary dark:hover:text-brand-400">
              {product.seller?.name || "Unknown Seller"}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start border-b dark:border-gray-800">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" id="reviews">
              Reviews ({product.reviews})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium dark:text-white">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.fullDescription}</p>

              <h3 className="text-lg font-medium dark:text-white">Key Features</h3>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {product.specifications?.map((spec, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {spec.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-16">
        <RelatedProducts productId={product.id} category={product.category} />
      </div>
    </div>
  )
}
