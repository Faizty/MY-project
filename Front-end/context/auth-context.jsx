"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { loginUser, registerUser, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getTokenRemainingTime } from "@/lib/jwt-utils"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)
  const router = useRouter()
  const { toast } = useToast()
  const logoutTimerRef = useRef(null)
  const redirectTimeoutRef = useRef(null)

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current)
    }
  }, [])

  // Logout function defined early to avoid reference issues
  const logout = useCallback(() => {
    console.log("Logging out user...")

    // Clear all timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_role")
      localStorage.removeItem("cart")
      localStorage.removeItem("wishlist")
      localStorage.removeItem("recentSearches")
      localStorage.removeItem("notifications")
      localStorage.removeItem("lastRedirectPath")
      localStorage.removeItem("current_user_id")
    }

    // Reset user state
    setUser(null)
    setToken(null)

    // Redirect to login
    router.push("/login")
  }, [router])

  // Set up logout timer based on token expiration
  const setupLogoutTimer = useCallback(
    (token) => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }

      const remainingTime = getTokenRemainingTime(token)
      console.log(`Setting up logout timer: Token will expire in ${remainingTime} seconds`)

      if (remainingTime > 0) {
        logoutTimerRef.current = setTimeout(() => {
          console.log("Token expired, logging out...")
          logout()
        }, remainingTime * 1000)
      } else {
        // Token is already expired
        console.log("Token is already expired, logging out immediately")
        logout()
      }
    },
    [logout],
  )

  // Update user function
  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      try {
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem("auth_token")

        if (storedToken) {
          console.log("Found stored token, validating with server...")

          try {
            // Validate token with server and get user data
            const userData = await getCurrentUser()

            if (userData) {
              console.log("Token is valid, setting up user")
              setUser(userData)
              setToken(storedToken)
              setupLogoutTimer(storedToken)

              // Check if user is a seller and redirect if needed
              if (userData.role === "seller") {
                const currentPath = window.location.pathname
                if (currentPath === "/" || currentPath === "/login") {
                  console.log("Seller detected on home page during init, redirecting to dashboard...")
                  router.replace("/seller/dashboard")
                }
              }
            }
          } catch (error) {
            console.log("Token validation failed:", error.message)
            // Token is invalid, clear it and redirect silently
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_role")
            localStorage.removeItem("current_user_id")
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_role")
          localStorage.removeItem("current_user_id")
        }
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router, setupLogoutTimer])

  // Role-based routing - restrict sellers to specific pages
  useEffect(() => {
    if (user && user.role === "seller" && typeof window !== "undefined") {
      const currentPath = window.location.pathname

      // Define allowed paths for sellers
      const allowedSellerPaths = [
        "/seller/dashboard",
        "/seller/orders", 
        "/seller/products",
        "/seller/products/new",
        "/seller/products/edit",
        "/messages", 
        "/profile",
        "/settings",
      ]

      // Check if current path is allowed for sellers
      const isAllowedPath = allowedSellerPaths.some((path) => {
        return currentPath === path || currentPath.startsWith(path)
      })

      // Also allow dynamic order detail pages like /seller/orders/123
      const isOrderDetailPage = /^\/seller\/orders\/[^/]+$/.test(currentPath)

      if (!isAllowedPath && !isOrderDetailPage) {
        console.log("🔒 Seller accessing restricted path, redirecting to dashboard")
        router.replace("/seller/dashboard")
      }
    }
  }, [user, router])

  // Login function with immediate redirection for sellers
  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: "Email and password are required",
        }
      }

      const response = await loginUser(email, password)

      if (!response.success || !response.user || !response.token) {
        return {
          success: false,
          error: "Invalid response from server",
        }
      }

      const { user, token } = response
      const isSeller = user.role === "seller"

      // Store token and user data (only on client side)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_role", user.role)
        localStorage.setItem("current_user_id", user.id)
      }

      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })

      // For sellers, use direct window location change for immediate redirection
      if (isSeller && typeof window !== "undefined") {
        console.log("Seller login detected, redirecting immediately to dashboard...")

        // Set user state first
        setUser(user)
        setToken(token)
        setupLogoutTimer(token)

        // Dispatch event before navigation
        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: { user, token },
          }),
        )

        // Use direct window location for immediate effect
        window.location.href = "/seller/dashboard"
        return { success: true }
      }

      // For customers, use normal flow
      setUser(user)
      setToken(token)
      setupLogoutTimer(token)

      // Dispatch a custom event to notify other contexts that login is complete
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: { user, token },
          }),
        )
      }

      // Regular customers go to home page
      router.push("/")
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)

      // Handle specific error messages from API
      let errorMessage = "Failed to login. Please try again."

      if (error.message.includes("Invalid") || error.message.includes("credentials")) {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.message.includes("not found")) {
        errorMessage = "User not found. Please check your email or sign up for a new account."
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  // Register function with immediate redirection for sellers
  const register = async (name, email, password, role = "customer") => {
    try {
      if (!name || !email || !password) {
        return {
          success: false,
          error: "Name, email, and password are required",
        }
      }

      // Validate role
      if (role !== "customer" && role !== "seller") {
        return {
          success: false,
          error: "Invalid role selected",
        }
      }

      const response = await registerUser(name, email, password, role)

      if (!response.success || !response.user || !response.token) {
        return {
          success: false,
          error: "Invalid response from server",
        }
      }

      const { user, token } = response
      const isSeller = role === "seller"

      console.log("Registration successful:", user)

      // Store token and user data (only on client side)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_role", user.role)
        localStorage.setItem("current_user_id", user.id)
      }

      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome to TechTrove, ${user.name}!`,
      })

      // For sellers, use direct window location change for immediate redirection
      if (isSeller && typeof window !== "undefined") {
        console.log("New seller registered, redirecting immediately to dashboard...")

        // Set user state first
        setUser(user)
        setToken(token)
        setupLogoutTimer(token)

        // Use direct window location for immediate effect
        window.location.href = "/seller/dashboard"
        return { success: true }
      }

      // For customers, use normal flow
      setUser(user)
      setToken(token)
      setupLogoutTimer(token)

      // Regular customers go to home page
      router.push("/")
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)

      // Handle specific error messages from API
      let errorMessage = "Failed to register. Please try again."

      if (error.message.includes("already") || error.message.includes("exists")) {
        errorMessage = "This email is already registered. Please use a different email or login."
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
