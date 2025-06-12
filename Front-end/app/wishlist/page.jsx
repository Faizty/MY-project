"use client"

import { useState } from "react"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import ProductCard from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { wishlist, isLoading } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [addingAll, setAddingAll] = useState(false)

  const handleAddAllToCart = async () => {
    setAddingAll(true)
    try {
      console.log("Adding all wishlist items to cart:", wishlist)

      // Check if wishlist is empty
      if (!wishlist || wishlist.length === 0) {
        toast({
          title: "Wishlist is empty",
          description: "There are no items in your wishlist to add to cart.",
          variant: "default",
        })
        return
      }

      // Add each product to cart
      for (const item of wishlist) {
        try {
          if (!item.product) {
            console.warn("Wishlist item missing product data:", item)
            continue
          }

          console.log("Adding to cart:", item.product)
          await addToCart(item.product, 1)
        } catch (itemError) {
          console.error("Error adding item to cart:", itemError, item)
        }
      }

      toast({
        title: "Success",
        description: "All wishlist items have been added to your cart",
      })
    } catch (error) {
      console.error("Error adding all to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add all items to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingAll(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist ({wishlist?.length || 0} items)</h1>
        <div className="flex gap-4">
          <Button onClick={handleAddAllToCart} disabled={addingAll || !wishlist?.length}>
            {addingAll ? "Adding..." : "Add All to Cart"}
          </Button>
        </div>
      </div>

      {!wishlist || wishlist.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-medium text-gray-600 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Add items to your wishlist by clicking the heart icon on products</p>
          <Button variant="outline" asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            if (!item || !item.product) {
              console.warn("Invalid wishlist item:", item)
              return null
            }

            return <ProductCard key={item.id} product={item.product} showWishlistButton={true} />
          })}
        </div>
      )}
    </div>
  )
}
