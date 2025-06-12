"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from "@/lib/api"

const WishlistContext = createContext(undefined)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])
  const [wishlistProductIds, setWishlistProductIds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated, token } = useAuth()

  // Load wishlist from API on initial render and when auth state changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !token) {
        // Clear wishlist if not authenticated
        setWishlist([])
        setWishlistProductIds([])
        return
      }

      setIsLoading(true)
      try {
        console.log("🤍 Fetching wishlist...")
        const data = await getWishlist()
        console.log("🤍 Received wishlist data:", data)

        // Ensure data is an array
        const wishlistItems = Array.isArray(data) ? data : []

        setWishlist(wishlistItems)

        // Extract product IDs for quick lookup
        const productIds = wishlistItems.map((item) => String(item.product_id))
        setWishlistProductIds(productIds)

        console.log("🤍 Extracted product IDs:", productIds)
      } catch (error) {
        console.error("🤍 Error fetching wishlist:", error)
        toast({
          title: "Error",
          description: "Failed to load your wishlist. Please try again later.",
          variant: "destructive",
        })
        // Set empty arrays on error
        setWishlist([])
        setWishlistProductIds([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [isAuthenticated, token, toast])

  const isInWishlist = (productId) => {
    // Convert to string for consistent comparison
    const stringId = String(productId)
    return wishlistProductIds.includes(stringId)
  }

  const addToWishlist = async (productId) => {
    // Convert to string for consistent storage
    const stringId = String(productId)
    console.log(`🤍 Adding product to wishlist: ${stringId}`)

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    // Optimistic update
    setWishlistProductIds((prev) => [...prev, stringId])

    try {
      const newItem = await addToWishlistAPI(productId)
      console.log("🤍 Added to wishlist:", newItem)

      setWishlist((prev) => [...prev, newItem])

      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
      })
    } catch (error) {
      console.error("🤍 Error adding to wishlist:", error)

      // Rollback optimistic update
      setWishlistProductIds((prev) => prev.filter((id) => id !== stringId))

      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (productId) => {
    // Convert to string for consistent comparison
    const stringId = String(productId)
    console.log(`🤍 Removing product from wishlist: ${stringId}`)

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your wishlist",
        variant: "destructive",
      })
      return
    }

    // Optimistic update
    setWishlistProductIds((prev) => prev.filter((id) => id !== stringId))
    const removedItem = wishlist.find((item) => String(item.product_id) === stringId)
    setWishlist((prev) => prev.filter((item) => String(item.product_id) !== stringId))

    try {
      await removeFromWishlistAPI(productId)
      console.log("🤍 Removed from wishlist:", productId)

      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist",
      })
    } catch (error) {
      console.error("🤍 Error removing from wishlist:", error)

      // Rollback optimistic update
      if (removedItem) {
        setWishlist((prev) => [...prev, removedItem])
        setWishlistProductIds((prev) => [...prev, stringId])
      }

      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleWishlistItem = (productId) => {
    // Convert to string for consistent handling
    const stringId = String(productId)
    console.log(`🤍 Toggling wishlist item: ${stringId}`)

    if (isInWishlist(stringId)) {
      removeFromWishlist(stringId)
    } else {
      addToWishlist(stringId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlistItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
