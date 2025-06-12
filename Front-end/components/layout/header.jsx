"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  LogOut,
  Bell,
  MessageSquare,
  Settings,
  Package,
  Search,
  Zap,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWishlist } from "@/context/wishlist-context"
import { useNotifications } from "@/context/notification-context"
import NotificationsDropdown from "@/components/notifications/notifications-dropdown"
import ThemeToggle from "@/components/theme-toggle"
import { getUserAvatar } from "@/lib/api"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const { unreadCount } = useNotifications()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const isSeller = user?.role === "seller"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
  }, [pathname])

  // Fetch user's existing avatar
  const fetchUserAvatar = async () => {
    if (!user?.id) return

    try {
      const response = await getUserAvatar(user.id)
      if (response.success && response.avatarData) {
        // Convert binary data to base64 URL
        const base64 = btoa(
          new Uint8Array(response.avatarData).reduce((data, byte) => data + String.fromCharCode(byte), ""),
        )
        const avatarDataUrl = `data:image/jpeg;base64,${base64}`
        setAvatarUrl(avatarDataUrl)
      }
    } catch (error) {
      console.error("Error fetching avatar:", error)
      // If avatar fetch fails, it's not critical - user just won't see existing avatar
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchUserAvatar()
    } else {
      setAvatarUrl("")
    }
  }, [user?.id])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <style jsx global>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-white shadow-md dark:bg-gray-900 dark:shadow-gray-800/20"
            : "bg-white/80 backdrop-blur-md dark:bg-gray-900/80"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with click effects */}
            <Link href={isSeller ? "/seller/dashboard" : "/"} className="flex items-center">
              <div
                className="relative group cursor-pointer active:scale-95 transition-transform duration-150"
                onClick={(e) => {
                  // Create ripple effect on click
                  const button = e.currentTarget
                  const circle = document.createElement("span")
                  const diameter = Math.max(button.clientWidth, button.clientHeight)

                  circle.style.width = circle.style.height = `${diameter}px`
                  circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`
                  circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`
                  circle.classList.add("absolute", "rounded-full", "bg-white", "opacity-30", "pointer-events-none")
                  circle.style.transform = "scale(0)"
                  circle.style.animation = "ripple 600ms linear"

                  const ripple = button.getElementsByClassName("ripple")[0]
                  if (ripple) {
                    ripple.remove()
                  }

                  circle.classList.add("ripple")
                  button.appendChild(circle)

                  // Remove the ripple after animation completes
                  setTimeout(() => {
                    if (circle) circle.remove()
                  }, 600)
                }}
              >
                {/* Logo Container with enhanced styling */}
                <div className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-500 dark:to-teal-600 rounded-lg px-3 py-1.5 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/20 active:shadow-inner active:from-emerald-700 active:to-teal-800 dark:active:from-emerald-600 dark:active:to-teal-700">
                  {/* Animated Circuit Board Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] group-hover:[background-size:10px_10px] transition-all duration-700"></div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-x-6 -translate-y-6 group-hover:translate-y-[-40%] group-active:translate-y-[-20%] transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-black/10 rounded-full translate-x-2 translate-y-4 group-hover:translate-y-[60%] group-active:translate-y-[40%] transition-all duration-700"></div>

                  {/* Lightning Icon with enhanced animation */}
                  <Zap className="h-5 w-5 text-white mr-1.5 transform -rotate-12 group-hover:rotate-0 group-active:rotate-12 transition-all duration-300 group-hover:scale-110 group-active:scale-90 group-hover:text-yellow-100" />

                  {/* Text with improved styling */}
                  <div className="flex items-baseline relative z-10">
                    <span className="text-white font-bold text-lg tracking-tight mr-0.5 group-hover:tracking-wide group-active:tracking-normal transition-all duration-300">
                      Ras
                    </span>
                    <span className="text-white/90 font-semibold text-sm tracking-tight group-hover:text-white group-active:text-white/80 transition-all duration-300">
                      Electronic
                    </span>
                  </div>

                  {/* Enhanced Glowing Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 group-active:opacity-50 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>

                  {/* Click Pulse Effect */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 scale-90 group-active:scale-100 group-active:opacity-100 transition-all duration-300 rounded-lg"></div>
                </div>

                {/* Enhanced Reflection Effect */}
                <div className="absolute h-[3px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-b-lg opacity-70 group-hover:opacity-100 group-active:opacity-40 transition-opacity duration-300"></div>

                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-70 transition-opacity duration-500 bg-emerald-500/20 blur-xl -z-10"></div>
              </div>
            </Link>

            {/* Desktop Navigation - Only show for customers */}
            {!isSeller && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === link.href
                        ? "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-900/30"
                        : "text-gray-600 hover:text-brand-700 hover:bg-brand-50/50 dark:text-gray-300 dark:hover:text-brand-300 dark:hover:bg-brand-900/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Seller Navigation - Show orders and messages links for sellers */}
            {isSeller && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/seller/orders"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname.startsWith("/seller/orders")
                      ? "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-900/30"
                      : "text-gray-600 hover:text-brand-700 hover:bg-brand-50/50 dark:text-gray-300 dark:hover:text-brand-300 dark:hover:bg-brand-900/20"
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/messages"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === "/messages"
                      ? "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-900/30"
                      : "text-gray-600 hover:text-brand-700 hover:bg-brand-50/50 dark:text-gray-300 dark:hover:text-brand-300 dark:hover:bg-brand-900/20"
                  }`}
                >
                  Messages
                </Link>
              </nav>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Bar - Only show for customers */}
              {!isSeller && (
                <div className="relative w-64">
                  <div className="flex items-center rounded-md border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <Input
                      placeholder="Search products..."
                      className="border-0 focus-visible:ring-0 dark:bg-gray-800 dark:placeholder:text-gray-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          router.push(`/products?q=${searchQuery}`)
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (searchQuery.trim()) {
                          router.push(`/products?q=${searchQuery}`)
                        }
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Theme Toggle - Show for all users */}
              <ThemeToggle />

              {/* Wishlist - Only show for customers */}
              {!isSeller && isAuthenticated && (
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-600">
                        {wishlist.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart - Only show for customers */}
              {!isSeller && isAuthenticated && (
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-600">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  {/* Notifications - Only show for customers */}
                  {!isSeller && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                          <Bell className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        sideOffset={5}
                        className="w-[350px] p-0 bg-white border shadow-md dark:bg-gray-800 dark:border-gray-700"
                      >
                        <NotificationsDropdown />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* User Menu - Show for all authenticated users */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-brand-200 dark:border-brand-800">
                          <Image
                            src={avatarUrl || "/placeholder.svg?height=32&width=32"}
                            alt={user?.name || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      sideOffset={5}
                      className="w-56 bg-transparent border-none shadow-none p-0"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex w-full cursor-pointer items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>

                        {/* Messages - Show for all users */}
                        <DropdownMenuItem asChild>
                          <Link href="/messages" className="flex w-full cursor-pointer items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Messages</span>
                          </Link>
                        </DropdownMenuItem>

                        {/* Show orders for both customers and sellers */}
                        <DropdownMenuItem asChild>
                          <Link
                            href={isSeller ? "/seller/orders" : "/orders"}
                            className="flex w-full cursor-pointer items-center"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            <span>Orders</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex w-full cursor-pointer items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>

                        {/* Always show seller dashboard for sellers */}
                        {isSeller && (
                          <DropdownMenuItem asChild>
                            <Link href="/seller/dashboard" className="flex w-full cursor-pointer items-center">
                              <Package className="mr-2 h-4 w-4" />
                              <span>Seller Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Only show for customers or if not authenticated */}
            {(!isSeller || !isAuthenticated) && (
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle />
                {!isSeller && isAuthenticated && (
                  <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemsCount > 0 && (
                        <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-600">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            )}

            {/* For sellers on mobile, show theme toggle, orders, messages, and profile */}
            {isSeller && isAuthenticated && (
              <div className="flex items-center gap-2 md:hidden">
                <Link
                  href="/seller/orders"
                  className="text-gray-600 hover:text-brand-700 text-sm font-medium dark:text-gray-300 dark:hover:text-brand-300"
                >
                  Orders
                </Link>
                <Link
                  href="/messages"
                  className="text-gray-600 hover:text-brand-700 text-sm font-medium dark:text-gray-300 dark:hover:text-brand-300"
                >
                  Messages
                </Link>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-brand-200 dark:border-brand-800">
                        <Image
                          src={avatarUrl || "/placeholder.svg?height=32&width=32"}
                          alt={user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/orders">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Only show for customers */}
        {isMenuOpen && !isSeller && (
          <div className="md:hidden">
            <div className="container mx-auto px-4 pb-3">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === link.href
                        ? "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-900/30"
                        : "text-gray-600 hover:text-brand-700 hover:bg-brand-50/50 dark:text-gray-300 dark:hover:text-brand-300 dark:hover:bg-brand-900/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link href="/wishlist" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md">
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                      <Badge className="h-5 rounded-full px-2 bg-brand-600 ml-auto">{wishlist.length}</Badge>
                    )}
                  </Link>
                )}
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md">
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Badge className="h-5 rounded-full px-2 bg-red-500 ml-auto">{unreadCount}</Badge>
                      )}
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 p-3">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-brand-600 hover:bg-brand-700">Sign up</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
