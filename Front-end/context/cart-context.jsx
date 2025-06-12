"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getCart, addToCartAPI, updateCartItemQuantity, removeFromCartAPI, clearCartAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  // Load cart from localStorage for guest users or API for authenticated users
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        // Load cart from API for authenticated users (normal flow)
        try {
          setIsLoading(true)
          console.log("🛒 Loading cart for authenticated user...")
          const cartData = await getCart()

          if (cartData.success && cartData.cart && cartData.cart.items) {
            console.log("🛒 Cart loaded successfully:", cartData.cart.items)
            // Transform API cart format to frontend format
            const transformedCart = cartData.cart.items.map((item) => {
              const originalPrice = item.product?.price || 0
              const discount = item.product?.discount || 0
              const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice

              return {
                id: item.product?.id || "unknown",
                cartItemId: item.id,
                name: item.product?.name || "Unknown Product",
                price: discountedPrice,
                originalPrice: originalPrice,
                image: item.product?.image_url || item.product?.image || "/placeholder.svg?height=64&width=64",
                quantity: item.quantity || 1,
                stock: item.product?.stock || 0,
                discount: discount,
              }
            })
            console.log("🛒 Transformed cart:", transformedCart)
            setCart(transformedCart)
          } else {
            console.log("🛒 Empty cart or invalid response")
            setCart([])
          }
        } catch (error) {
          console.error("🛒 Error loading cart:", error)
          // Fallback to localStorage if API fails
          loadGuestCart()
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load cart from localStorage for guest users
        console.log("🛒 Loading cart for guest user...")
        loadGuestCart()
      }
    }

    const loadGuestCart = () => {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          console.log("🛒 Guest cart loaded:", parsedCart)
          setCart(parsedCart)
        } catch (error) {
          console.error("🛒 Error parsing cart from localStorage:", error)
          setCart([])
        }
      } else {
        console.log("🛒 No guest cart found")
        setCart([])
      }
    }

    loadCart()
  }, [isAuthenticated, user])

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isAuthenticated])

  // Clear cart when user logs out
  useEffect(() => {
    const handleUserChange = () => {
      setCart([])
    }

    window.addEventListener("userChanged", handleUserChange)

    return () => {
      window.removeEventListener("userChanged", handleUserChange)
    }
  }, [])

  const addToCart = async (item) => {
    console.log("🛒 Adding to cart:", item)

    // Check if item already exists in cart (frontend validation)
    const existingItem = cart.find(
      (cartItem) => String(cartItem.id) === String(item.id) || Number(cartItem.id) === Number(item.id),
    )

    if (existingItem) {
      toast({
        title: "Item already in cart",
        description: `${item.name} is already in your cart. Please update the quantity in your cart page.`,
        variant: "destructive",
      })
      return
    }

    if (isAuthenticated) {
      // Add to cart via API for authenticated users
      try {
        setIsLoading(true)
        console.log("🛒 Adding to cart via API...")

        // Ensure we're sending a numeric product ID
        const numericProductId = Number(item.id)
        if (isNaN(numericProductId)) {
          throw new Error("Invalid product ID format")
        }

        const result = await addToCartAPI(numericProductId, item.quantity || 1)

        console.log("🛒 Add to cart API result:", result)

        if (result.success && result.cart && result.cart.items) {
          // Find the newly added item in the response
          const addedItem = result.cart.items.find(
            (cartItem) => cartItem.product?.id === item.id || Number(cartItem.product?.id) === Number(item.id),
          )

          if (addedItem) {
            // Update local cart state based on API response
            const newCartItem = {
              id: addedItem.product?.id || item.id,
              cartItemId: addedItem.id,
              name: addedItem.product?.name || item.name || "Unknown Product",
              price:
                addedItem.product?.discount > 0
                  ? addedItem.product.price * (1 - addedItem.product.discount / 100)
                  : addedItem.product?.price || item.price || 0,
              originalPrice: addedItem.product?.price || item.price || 0,
              image:
                addedItem.product?.image_url ||
                addedItem.product?.image ||
                item.image ||
                "/placeholder.svg?height=64&width=64",
              quantity: addedItem.quantity || 1,
              stock: addedItem.product?.stock || item.stock || 0,
              discount: addedItem.product?.discount || item.discount || 0,
            }

            console.log("🛒 New cart item:", newCartItem)

            setCart((prevCart) => {
              const existingItemIndex = prevCart.findIndex(
                (i) => String(i.id) === String(item.id) || Number(i.id) === Number(item.id),
              )

              if (existingItemIndex >= 0) {
                // Update existing item
                const updatedCart = [...prevCart]
                updatedCart[existingItemIndex] = newCartItem
                console.log("🛒 Updated existing item in cart")
                return updatedCart
              } else {
                // Add new item
                console.log("🛒 Added new item to cart")
                return [...prevCart, newCartItem]
              }
            })

            toast({
              title: "Added to cart",
              description: `${newCartItem.name} has been added to your cart.`,
            })
          } else {
            // If we can't find the specific item, reload the entire cart
            console.log("🛒 Reloading entire cart after add")
            const transformedCart = result.cart.items.map((cartItem) => ({
              id: cartItem.product?.id || "unknown",
              cartItemId: cartItem.id,
              name: cartItem.product?.name || "Unknown Product",
              price: cartItem.product?.price || 0,
              image: cartItem.product?.image_url || cartItem.product?.image || "/placeholder.svg?height=64&width=64",
              quantity: cartItem.quantity || 1,
              stock: cartItem.product?.stock || 0,
              discount: cartItem.product?.discount || 0,
            }))
            setCart(transformedCart)

            toast({
              title: "Added to cart",
              description: `${item.name} has been added to your cart.`,
            })
          }
        } else {
          throw new Error("Invalid response format from server")
        }
      } catch (error) {
        console.error("🛒 Error adding to cart:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Add to localStorage for guest users
      console.log("🛒 Adding to guest cart...")
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((i) => String(i.id) === String(item.id))

        if (existingItemIndex >= 0) {
          // Item already exists, add the new quantity to existing quantity
          const updatedCart = [...prevCart]
          updatedCart[existingItemIndex].quantity += item.quantity || 1
          console.log("🛒 Updated guest cart item quantity")
          return updatedCart
        } else {
          // Item doesn't exist, add it with the specified quantity or default to 1
          console.log("🛒 Added new item to guest cart")
          const discountedPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price
          return [
            ...prevCart,
            { ...item, price: discountedPrice, originalPrice: item.price, quantity: item.quantity || 1 },
          ]
        }
      })

      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
      })
    }
  }

  const removeFromCart = async (id) => {
    console.log("🛒 Removing from cart:", id)
    console.log("🛒 Current cart before removal:", cart)

    if (isAuthenticated) {
      // Remove from cart via API for authenticated users
      try {
        setIsLoading(true)
        // Find the cart item by comparing both string and numeric IDs
        const cartItem = cart.find(
          (item) => String(item.id) === String(id) || Number(item.id) === Number(id) || item.cartItemId === id,
        )

        console.log("🛒 Found cart item to remove:", cartItem)

        if (cartItem && cartItem.cartItemId) {
          const result = await removeFromCartAPI(cartItem.cartItemId)

          if (result.success) {
            // More robust filtering - remove only the specific item
            setCart((prevCart) => {
              const newCart = prevCart.filter(
                (item) =>
                  !(
                    String(item.id) === String(id) ||
                    Number(item.id) === Number(id) ||
                    item.cartItemId === cartItem.cartItemId
                  ),
              )
              console.log("🛒 Cart after removal:", newCart)
              return newCart
            })

            toast({
              title: "Removed from cart",
              description: "Item has been removed from your cart.",
            })
          }
        } else {
          console.error("🛒 Cart item not found for removal:", id)
          toast({
            title: "Error",
            description: "Item not found in cart.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("🛒 Error removing from cart:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to remove item from cart. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Remove from localStorage for guest users
      setCart((prevCart) => {
        const newCart = prevCart.filter((item) => !(String(item.id) === String(id) || Number(item.id) === Number(id)))
        console.log("🛒 Guest cart after removal:", newCart)
        return newCart
      })

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return

    console.log("🛒 Updating quantity:", { id, quantity })
    console.log("🛒 Current cart:", cart)

    if (isAuthenticated) {
      // Update quantity via API for authenticated users
      try {
        setIsLoading(true)
        // Find the cart item by comparing both string and numeric IDs
        const cartItem = cart.find(
          (item) => String(item.id) === String(id) || Number(item.id) === Number(id) || item.cartItemId === id,
        )

        console.log("🛒 Found cart item to update:", cartItem)

        if (cartItem && cartItem.cartItemId) {
          const result = await updateCartItemQuantity(cartItem.cartItemId, quantity)

          if (result.success) {
            setCart((prevCart) =>
              prevCart.map((item) =>
                String(item.id) === String(id) ||
                Number(item.id) === Number(id) ||
                item.cartItemId === cartItem.cartItemId
                  ? { ...item, quantity }
                  : item,
              ),
            )
          }
        }
      } catch (error) {
        console.error("🛒 Error updating quantity:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update quantity. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Update quantity in localStorage for guest users
      setCart((prevCart) =>
        prevCart.map((item) =>
          String(item.id) === String(id) || Number(item.id) === Number(id) ? { ...item, quantity } : item,
        ),
      )
    }
  }

  const clearCart = async () => {
    console.log("🛒 Clearing cart...")

    if (isAuthenticated) {
      // Clear cart via API for authenticated users
      try {
        setIsLoading(true)
        const result = await clearCartAPI()

        if (result.success) {
          setCart([])

          toast({
            title: "Cart cleared",
            description: "All items have been removed from your cart.",
          })
        }
      } catch (error) {
        console.error("🛒 Error clearing cart:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to clear cart. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Clear localStorage for guest users
      setCart([])

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
