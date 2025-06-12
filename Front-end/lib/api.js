// Clean API functions - Only keeping what's actually used in the application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Get authentication token from localStorage
function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Create headers with authentication
function createHeaders() {
  const token = getAuthToken()
  const headers = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// ===== AUTHENTICATION API FUNCTIONS =====

export async function registerUser(name, email, password, role = "customer") {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        throw new Error("Invalid or expired token")
      }
      throw new Error("Failed to get user data")
    }

    const userData = await response.json()
    return userData
  } catch (error) {
    console.error("Get current user error:", error)
    throw error
  }
}

// ===== USER PROFILE API FUNCTIONS =====

export async function updateUserProfile(userData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: userData.name,
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || "",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Profile update failed")
    }

    return data
  } catch (error) {
    console.error("Profile update error:", error)
    throw error
  }
}

// Avatar upload function with FormData
export async function uploadAvatar(formData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No token found")
    }

    console.log("Uploading avatar to:", `${API_BASE_URL}/api/users/avatar`)

    const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        
      },
      body: formData,
    })

    console.log("Avatar upload response status:", response.status)

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } else {
          const textError = await response.text()
          if (textError) {
            errorMessage = textError
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }

      throw new Error(errorMessage)
    }

    // Check if response has content
    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      const responseText = await response.text()

      if (!responseText || responseText.trim() === "") {
        // Empty response - create a success response
        data = {
          success: true,
          message: "Avatar uploaded successfully",
        }
      } else {
        try {
          data = JSON.parse(responseText)
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError)
          console.error("Response text:", responseText)
          throw new Error("Invalid JSON response from server")
        }
      }
    } else {
      // Non-JSON response - assume success if status is ok
      data = {
        success: true,
        message: "Avatar uploaded successfully",
      }
    }

    return data
  } catch (error) {
    console.error("Avatar upload error:", error)

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server. Please check if the server is running.")
    }

    throw error
  }
}

// Get user avatar function
export async function getUserAvatar(userId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/avatar`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No avatar found - this is not an error
        return { success: false, message: "No avatar found" }
      }
      throw new Error(`Failed to fetch avatar: ${response.status}`)
    }

    // Get the binary data
    const avatarData = await response.arrayBuffer()

    return {
      success: true,
      avatarData: avatarData,
    }
  } catch (error) {
    console.error("Get avatar error:", error)
    throw error
  }
}

// ===== PRODUCT API FUNCTIONS =====

export async function getProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value)
      }
    })

    const url = `${API_BASE_URL}/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

    const response = await fetch(url, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const products = await response.json()
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
    }

    const product = await response.json()
    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    throw error
  }
}

// Get related products based on category
export async function getRelatedProducts(productId, category, limit = 4) {
  try {
    console.log(`🔗 Getting related products for product ${productId} in category ${category}`)

    // Get all products first
    const allProducts = await getProducts()

    if (!allProducts || allProducts.length === 0) {
      return []
    }

    // Filter products by category and exclude current product
    let relatedProducts = allProducts.filter(
      (product) =>
        product.category?.toLowerCase() === category?.toLowerCase() && String(product.id) !== String(productId),
    )

    // If we don't have enough products in the same category,
    // add some random products from other categories
    if (relatedProducts.length < limit) {
      const otherProducts = allProducts.filter(
        (product) =>
          product.category?.toLowerCase() !== category?.toLowerCase() && String(product.id) !== String(productId),
      )

      // Shuffle and add random products to fill the limit
      const shuffled = otherProducts.sort(() => 0.5 - Math.random())
      const needed = limit - relatedProducts.length
      relatedProducts = [...relatedProducts, ...shuffled.slice(0, needed)]
    }

    // Limit the results and shuffle them
    const result = relatedProducts.sort(() => 0.5 - Math.random()).slice(0, limit)

    console.log(`🔗 Found ${result.length} related products`)
    return result
  } catch (error) {
    console.error("🔗 Error getting related products:", error)
    return []
  }
}

export async function getSellerProducts(sellerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/Seller/${sellerId}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch seller products: ${response.status} ${response.statusText}`)
    }

    const products = await response.json()
    return products
  } catch (error) {
    console.error("Error fetching seller products:", error)
    throw error
  }
}

export async function addProduct(productData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    })
    const message = `New product ${productData.name} has arrived!`
    createNotification(message)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create product: ${response.status}`)
    }

    const newProduct = await response.json()
    return newProduct
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(productId, updateData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to update product: ${response.status}`)
    }

    const updatedProduct = await response.json()
    return updatedProduct
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(productId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to delete product: ${response.status}`)
    }

    return {
      success: true,
      message: "Product deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// ===== REVIEW API FUNCTIONS =====

export async function getProductReviews(productId, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch reviews: ${response.status}`)
    }

    const reviews = await response.json()

    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      productId: productId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: review.createdAt,
      verified: true,
      helpfulCount: 0,
      images: [],
    }))

    let filteredReviews = transformedReviews

    if (options.ratingFilter && options.ratingFilter > 0) {
      filteredReviews = filteredReviews.filter((review) => Math.floor(review.rating) === options.ratingFilter)
    }

    if (options.verifiedOnly) {
      filteredReviews = filteredReviews.filter((review) => review.verified)
    }

    switch (options.sort) {
      case "newest":
        filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case "oldest":
        filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case "highest":
        filteredReviews.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        filteredReviews.sort((a, b) => a.rating - b.rating)
        break
      case "most_helpful":
        filteredReviews.sort((a, b) => b.helpfulCount - a.helpfulCount)
        break
      default:
        filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return filteredReviews
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw error
  }
}

export async function addReview(reviewData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const requestBody = {
      title: reviewData.title,
      comment: reviewData.comment,
      rating: reviewData.rating,
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${reviewData.productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to add review: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()

    const transformedReview = {
      id: result.id,
      productId: reviewData.productId,
      userId: result.userId,
      userName: result.userName,
      rating: result.rating,
      title: result.title,
      comment: reviewData.comment,
      date: result.createdAt,
      verified: true,
      helpfulCount: 0,
      images: [],
    }

    return transformedReview
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// ===== CART API FUNCTIONS =====

export async function getCart() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch cart: ${response.status} - ${errorText}`)
    }

    const cartData = await response.json()
    return cartData
  } catch (error) {
    console.error("Error fetching cart:", error)
    throw error
  }
}

export async function addToCartAPI(productId, quantity = 1) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const requestBody = {
      product_id: String(productId),
      quantity: quantity,
    }

    const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to add item to cart: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const responseText = await response.text()

    if (!responseText) {
      throw new Error("Empty response from server")
    }

    const trimmedResponse = responseText.trim()
    if (!trimmedResponse.startsWith("{") && !trimmedResponse.startsWith("[")) {
      throw new Error("Response is not valid JSON format")
    }

    if (trimmedResponse.toLowerCase().includes("<html>") || trimmedResponse.toLowerCase().includes("<!doctype")) {
      throw new Error("Server returned HTML instead of JSON - check server logs")
    }

    let result
    try {
      result = JSON.parse(trimmedResponse)
    } catch (parseError) {
      throw new Error(`Invalid JSON response from server: ${parseError.message}`)
    }

    return result
  } catch (error) {
    console.error("Error adding item to cart:", error)
    throw error
  }
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to update cart item: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error updating cart item:", error)
    throw error
  }
}

export async function removeFromCartAPI(cartItemId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to remove item from cart: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error removing item from cart:", error)
    throw error
  }
}

export async function clearCartAPI() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to clear cart: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}

// ===== WISHLIST API FUNCTIONS =====

export async function getWishlist() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch wishlist: ${response.status} - ${errorText}`)
    }

    const wishlistData = await response.json()
    return wishlistData
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    throw error
  }
}

export async function addToWishlistAPI(productId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const requestBody = {
      product_id: String(productId),
    }

    const response = await fetch(`${API_BASE_URL}/api/wishlist/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to add item to wishlist: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error adding item to wishlist:", error)
    throw error
  }
}

export async function removeFromWishlistAPI(productId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/wishlist/items/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to remove item from wishlist: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    let result = { success: true }
    const responseText = await response.text()
    if (responseText) {
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.log("Delete response was not JSON, assuming success")
      }
    }

    return result
  } catch (error) {
    console.error("Error removing item from wishlist:", error)
    throw error
  }
}

// ===== ORDER API FUNCTIONS =====

export async function createOrder(orderData) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        total_amount: orderData.total_amount,
        items: orderData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to create order: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function getCustomerOrders() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch customer orders: ${response.status} - ${errorText}`)
    }

    const orders = await response.json()
    return orders
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    throw error
  }
}

export async function getSellerOrders(sellerId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/orders/seller/${sellerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch seller orders: ${response.status} - ${errorText}`)
    }

    const orders = await response.json()
    return orders
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    throw error
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to update order status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

export async function markReviewHelpful(reviewId) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/helpful`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Failed to mark review as helpful: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error marking review as helpful:", error)
    throw error
  }
}

// ===== CHAPA PAYMENT API FUNCTIONS =====

const CHAPA_API_URL = "http://localhost:8080/api/payment/initialize"
const CHAPA_SECRET_KEY = "CHASECK_TEST-gi2wrwPWdIa3LuAKwD4GZqxI0Npnmsin"

// Initialize Chapa Payment
export async function initializePayment(paymentData) {
  try {
    console.log("💳 Initializing Chapa payment with data:", paymentData)

    const response = await fetch(CHAPA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: paymentData.amount.toString(), // Convert to string as required
        currency: "ETB",
        email: paymentData.email,
        first_name: paymentData.first_name, // User's name goes here
        last_name: "", // Keep empty as requested
        phone_number: paymentData.phone_number || "0912345678",
        tx_ref: paymentData.tx_ref,
        callback_url: paymentData.callback_url || "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
        return_url: paymentData.return_url || "http://localhost:3000",
        customization: {
          title: paymentData.customization?.title || "Payment for my favourite merchant",
          description: paymentData.customization?.description || "I love online payments",
        },
        meta: {
          hide_receipt: "true",
        },
      }),
    })

    console.log("💳 Chapa payment API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💳 Chapa payment API error response:", errorText)

      let errorMessage = `Payment initialization failed: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log("💳 Chapa payment API response:", result)

    return result
  } catch (error) {
    console.error("💳 Error initializing Chapa payment:", error)
    throw error
  }
}

// Process payment for an order
export async function processOrderPayment(orderData, userData) {
  try {
    // Generate unique transaction reference
    const txRef = `order-${orderData.orderId || Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    const paymentData = {
      amount: orderData.total_amount, // Total amount from order
      email: userData.email, // User's email
      first_name: userData.name, // User's name in first_name field (as requested)
      phone_number: userData.phone || "0912345678", // User's phone or default
      tx_ref: txRef,
      callback_url: `${window.location.origin}/api/payment/callback`,
      return_url: `${window.location.origin}/orders`,
      customization: {
        title: "E-commerce Order Payment",
        description: `Payment for order #${orderData.orderId || "New Order"}`,
      },
    }

    console.log("💳 Processing order payment:", paymentData)

    // Initialize payment with Chapa
    const paymentResponse = await initializePayment(paymentData)

    return {
      ...paymentResponse,
      tx_ref: txRef,
    }
  } catch (error) {
    console.error("💳 Error processing order payment:", error)
    throw error
  }
}

// ===== NOTIFICATION API FUNCTIONS =====

export async function createNotification(message) {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create notification: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function getNotifications() {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch notifications: ${response.status}`)
    }

    const notifications = await response.json()
    return notifications
  } catch (error) {
    console.error("Error fetching notifications:", error)
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}

// ===== UTILITY FUNCTIONS =====

export function getAllBrands() {
  return ["Apple", "Samsung", "Sony", "Microsoft", "Google", "Dell", "HP"]
}
