/**
 * E-Commerce Platform API and Database Structure
 *
 * This file outlines the API endpoints and database schema required for the e-commerce platform.
 */

// =============================================
// DATABASE SCHEMA
// =============================================

/**
 * User Schema
 *
 * Stores user account information
 */
const UserSchema = {
  id: "UUID, primary key",
  email: "String, unique, required",
  password: "String, hashed, required",
  firstName: "String, required",
  lastName: "String, required",
  phoneNumber: "String, optional",
  role: "Enum (customer, admin, seller), default: customer",
  avatar: "String, URL to profile image",
  addresses: "Array of Address objects",
  paymentMethods: "Array of PaymentMethod objects",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  lastLoginAt: "DateTime",
  isVerified: "Boolean, default: false",
  verificationToken: "String, optional",
  resetPasswordToken: "String, optional",
  resetPasswordExpires: "DateTime, optional",
  preferences: "JSON object for user preferences",
  marketingConsent: "Boolean, default: false",
}

/**
 * Address Schema
 *
 * Stores user addresses for shipping and billing
 */
const AddressSchema = {
  id: "UUID, primary key",
  userId: "UUID, foreign key to User",
  type: "Enum (shipping, billing)",
  isDefault: "Boolean, default: false",
  firstName: "String, required",
  lastName: "String, required",
  addressLine1: "String, required",
  addressLine2: "String, optional",
  city: "String, required",
  state: "String, required",
  postalCode: "String, required",
  country: "String, required",
  phoneNumber: "String, optional",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * Product Schema
 *
 * Stores product information
 */
const ProductSchema = {
  id: "UUID, primary key",
  sellerId: "UUID, foreign key to User (seller)",
  name: "String, required",
  slug: "String, unique, required",
  description: "Text, required",
  price: "Decimal, required",
  originalPrice: "Decimal, optional",
  discount: "Integer, percentage discount",
  currency: "String, default: USD",
  stock: "Integer, required",
  sku: "String, unique, required",
  barcode: "String, optional",
  weight: "Decimal, optional",
  dimensions: "JSON {length, width, height}, optional",
  images: "Array of Strings (URLs)",
  mainImage: "String, URL to main product image",
  categories: "Array of Category IDs",
  tags: "Array of Strings",
  attributes: "JSON object for product attributes",
  variants: "Array of ProductVariant objects",
  isActive: "Boolean, default: true",
  isFeatured: "Boolean, default: false",
  rating: "Decimal, calculated from reviews",
  reviewCount: "Integer, count of reviews",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  publishedAt: "DateTime, optional",
  metaTitle: "String, optional, for SEO",
  metaDescription: "String, optional, for SEO",
  metaKeywords: "Array of Strings, optional, for SEO",
}

/**
 * ProductVariant Schema
 *
 * Stores product variants (size, color, etc.)
 */
const ProductVariantSchema = {
  id: "UUID, primary key",
  productId: "UUID, foreign key to Product",
  name: "String, required",
  sku: "String, unique, required",
  price: "Decimal, optional (if different from product price)",
  stock: "Integer, required",
  attributes: "JSON object {color, size, etc.}",
  images: "Array of Strings (URLs)",
  isActive: "Boolean, default: true",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * Category Schema
 *
 * Stores product categories
 */
const CategorySchema = {
  id: "UUID, primary key",
  name: "String, required",
  slug: "String, unique, required",
  description: "Text, optional",
  parentId: "UUID, foreign key to Category, optional",
  image: "String, URL to category image, optional",
  isActive: "Boolean, default: true",
  order: "Integer, for sorting",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  metaTitle: "String, optional, for SEO",
  metaDescription: "String, optional, for SEO",
  metaKeywords: "Array of Strings, optional, for SEO",
}

/**
 * Cart Schema
 *
 * Stores user shopping carts
 */
const CartSchema = {
  id: "UUID, primary key",
  userId: "UUID, foreign key to User, optional (for guest carts)",
  sessionId: "String, for guest users",
  items: "Array of CartItem objects",
  subtotal: "Decimal, calculated",
  tax: "Decimal, calculated",
  shipping: "Decimal, calculated",
  discount: "Decimal, calculated",
  total: "Decimal, calculated",
  couponCode: "String, optional",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  expiresAt: "DateTime, optional",
}

/**
 * CartItem Schema
 *
 * Stores items in a cart
 */
const CartItemSchema = {
  id: "UUID, primary key",
  cartId: "UUID, foreign key to Cart",
  productId: "UUID, foreign key to Product",
  variantId: "UUID, foreign key to ProductVariant, optional",
  quantity: "Integer, required",
  price: "Decimal, price at time of adding to cart",
  attributes: "JSON object for selected attributes",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * Order Schema
 *
 * Stores customer orders
 */
const OrderSchema = {
  id: "UUID, primary key",
  orderNumber: "String, unique, required",
  userId: "UUID, foreign key to User, optional (for guest orders)",
  status: "Enum (pending, processing, shipped, delivered, cancelled, refunded)",
  items: "Array of OrderItem objects",
  subtotal: "Decimal, calculated",
  tax: "Decimal, calculated",
  shipping: "Decimal, calculated",
  discount: "Decimal, calculated",
  total: "Decimal, calculated",
  couponCode: "String, optional",
  shippingAddress: "Address object",
  billingAddress: "Address object",
  paymentMethod: "String, required",
  paymentStatus: "Enum (pending, paid, failed, refunded)",
  paymentDetails: "JSON object for payment details",
  shippingMethod: "String, required",
  trackingNumber: "String, optional",
  notes: "Text, optional",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  paidAt: "DateTime, optional",
  shippedAt: "DateTime, optional",
  deliveredAt: "DateTime, optional",
  cancelledAt: "DateTime, optional",
  refundedAt: "DateTime, optional",
}

/**
 * OrderItem Schema
 *
 * Stores items in an order
 */
const OrderItemSchema = {
  id: "UUID, primary key",
  orderId: "UUID, foreign key to Order",
  productId: "UUID, foreign key to Product",
  variantId: "UUID, foreign key to ProductVariant, optional",
  name: "String, product name at time of order",
  sku: "String, product SKU at time of order",
  price: "Decimal, price at time of order",
  quantity: "Integer, required",
  subtotal: "Decimal, calculated",
  tax: "Decimal, calculated",
  discount: "Decimal, calculated",
  total: "Decimal, calculated",
  attributes: "JSON object for selected attributes",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * Review Schema
 *
 * Stores product reviews
 */
const ReviewSchema = {
  id: "UUID, primary key",
  productId: "UUID, foreign key to Product",
  userId: "UUID, foreign key to User",
  orderId: "UUID, foreign key to Order, optional",
  rating: "Integer (1-5), required",
  title: "String, optional",
  content: "Text, required",
  images: "Array of Strings (URLs), optional",
  isVerifiedPurchase: "Boolean, default: false",
  isApproved: "Boolean, default: true",
  helpfulCount: "Integer, default: 0",
  reportCount: "Integer, default: 0",
  createdAt: "DateTime",
  updatedAt: "DateTime",
  publishedAt: "DateTime, optional",
}

/**
 * Wishlist Schema
 *
 * Stores user wishlists
 */
const WishlistSchema = {
  id: "UUID, primary key",
  userId: "UUID, foreign key to User",
  name: "String, default: 'Default'",
  isPublic: "Boolean, default: false",
  items: "Array of WishlistItem objects",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * WishlistItem Schema
 *
 * Stores items in a wishlist
 */
const WishlistItemSchema = {
  id: "UUID, primary key",
  wishlistId: "UUID, foreign key to Wishlist",
  productId: "UUID, foreign key to Product",
  variantId: "UUID, foreign key to ProductVariant, optional",
  addedAt: "DateTime",
}

/**
 * Coupon Schema
 *
 * Stores discount coupons
 */
const CouponSchema = {
  id: "UUID, primary key",
  code: "String, unique, required",
  type: "Enum (percentage, fixed_amount, free_shipping)",
  value: "Decimal, required for percentage and fixed_amount",
  minimumPurchase: "Decimal, optional",
  maximumDiscount: "Decimal, optional",
  usageLimit: "Integer, optional",
  usageCount: "Integer, default: 0",
  isActive: "Boolean, default: true",
  startsAt: "DateTime, optional",
  expiresAt: "DateTime, optional",
  applicableProducts: "Array of Product IDs, optional",
  applicableCategories: "Array of Category IDs, optional",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * SellerProfile Schema
 *
 * Stores seller-specific information
 */
const SellerProfileSchema = {
  id: "UUID, primary key",
  userId: "UUID, foreign key to User",
  storeName: "String, required",
  storeDescription: "Text, optional",
  logo: "String, URL to store logo, optional",
  banner: "String, URL to store banner, optional",
  contactEmail: "String, required",
  contactPhone: "String, optional",
  address: "Address object",
  socialLinks: "JSON object for social media links",
  policies: "JSON object for store policies",
  rating: "Decimal, calculated from reviews",
  reviewCount: "Integer, count of reviews",
  isVerified: "Boolean, default: false",
  isActive: "Boolean, default: true",
  commissionRate: "Decimal, percentage",
  paymentDetails: "JSON object for payment details",
  createdAt: "DateTime",
  updatedAt: "DateTime",
}

/**
 * Notification Schema
 *
 * Stores user notifications
 */
const NotificationSchema = {
  id: "UUID, primary key",
  userId: "UUID, foreign key to User",
  type: "Enum (order_status, promotion, system, etc.)",
  title: "String, required",
  message: "Text, required",
  link: "String, optional",
  isRead: "Boolean, default: false",
  createdAt: "DateTime",
  readAt: "DateTime, optional",
}

// =============================================
// API ENDPOINTS
// =============================================

/**
 * Authentication API
 */
const AuthAPI = {
  // Register a new user
  "POST /api/auth/register": {
    body: {
      email: "String, required",
      password: "String, required",
      firstName: "String, required",
      lastName: "String, required",
      phoneNumber: "String, optional",
      marketingConsent: "Boolean, optional",
    },
    response: {
      user: "User object (without password)",
      token: "JWT token",
    },
  },

  // Login user
  "POST /api/auth/login": {
    body: {
      email: "String, required",
      password: "String, required",
    },
    response: {
      user: "User object (without password)",
      token: "JWT token",
    },
  },

  // Request password reset
  "POST /api/auth/forgot-password": {
    body: {
      email: "String, required",
    },
    response: {
      message: "String",
    },
  },

  // Reset password
  "POST /api/auth/reset-password": {
    body: {
      token: "String, required",
      password: "String, required",
    },
    response: {
      message: "String",
    },
  },

  // Verify email
  "GET /api/auth/verify-email/:token": {
    response: {
      message: "String",
    },
  },

  // Refresh token
  "POST /api/auth/refresh-token": {
    body: {
      refreshToken: "String, required",
    },
    response: {
      token: "JWT token",
      refreshToken: "Refresh token",
    },
  },

  // Logout
  "POST /api/auth/logout": {
    response: {
      message: "String",
    },
  },
}

/**
 * User API
 */
const UserAPI = {
  // Get current user
  "GET /api/users/me": {
    response: {
      user: "User object (without password)",
    },
  },

  // Update user profile
  "PUT /api/users/me": {
    body: {
      firstName: "String, optional",
      lastName: "String, optional",
      phoneNumber: "String, optional",
      avatar: "String, optional",
      preferences: "JSON object, optional",
      marketingConsent: "Boolean, optional",
    },
    response: {
      user: "User object (without password)",
    },
  },

  // Change password
  "PUT /api/users/me/password": {
    body: {
      currentPassword: "String, required",
      newPassword: "String, required",
    },
    response: {
      message: "String",
    },
  },

  // Get user addresses
  "GET /api/users/me/addresses": {
    response: {
      addresses: "Array of Address objects",
    },
  },

  // Add user address
  "POST /api/users/me/addresses": {
    body: "Address object (without id)",
    response: {
      address: "Address object",
    },
  },

  // Update user address
  "PUT /api/users/me/addresses/:id": {
    body: "Address object (without id)",
    response: {
      address: "Address object",
    },
  },

  // Delete user address
  "DELETE /api/users/me/addresses/:id": {
    response: {
      message: "String",
    },
  },

  // Set default address
  "PUT /api/users/me/addresses/:id/default": {
    body: {
      type: "Enum (shipping, billing)",
    },
    response: {
      message: "String",
    },
  },
}

/**
 * Product API
 */
const ProductAPI = {
  // Get all products with filtering, sorting, and pagination
  "GET /api/products": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      sort: "String, default: 'createdAt:desc'",
      category: "String, optional",
      search: "String, optional",
      minPrice: "Decimal, optional",
      maxPrice: "Decimal, optional",
      rating: "Integer, optional",
      inStock: "Boolean, optional",
      featured: "Boolean, optional",
      sellerId: "UUID, optional",
      tags: "Array of Strings, optional",
    },
    response: {
      products: "Array of Product objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Get product by ID or slug
  "GET /api/products/:idOrSlug": {
    response: {
      product: "Product object",
    },
  },

  // Get related products
  "GET /api/products/:id/related": {
    query: {
      limit: "Integer, default: 4",
    },
    response: {
      products: "Array of Product objects",
    },
  },

  // Get product reviews
  "GET /api/products/:id/reviews": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 10",
      sort: "String, default: 'createdAt:desc'",
    },
    response: {
      reviews: "Array of Review objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Add product review
  "POST /api/products/:id/reviews": {
    body: {
      rating: "Integer (1-5), required",
      title: "String, optional",
      content: "Text, required",
      images: "Array of Strings (URLs), optional",
    },
    response: {
      review: "Review object",
    },
  },
}

/**
 * Category API
 */
const CategoryAPI = {
  // Get all categories
  "GET /api/categories": {
    query: {
      includeInactive: "Boolean, default: false",
    },
    response: {
      categories: "Array of Category objects",
    },
  },

  // Get category by ID or slug
  "GET /api/categories/:idOrSlug": {
    response: {
      category: "Category object",
    },
  },

  // Get category products
  "GET /api/categories/:idOrSlug/products": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      sort: "String, default: 'createdAt:desc'",
      minPrice: "Decimal, optional",
      maxPrice: "Decimal, optional",
      rating: "Integer, optional",
      inStock: "Boolean, optional",
    },
    response: {
      products: "Array of Product objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },
}

/**
 * Cart API
 */
const CartAPI = {
  // Get cart
  "GET /api/cart": {
    response: {
      cart: "Cart object",
    },
  },

  // Add item to cart
  "POST /api/cart/items": {
    body: {
      productId: "UUID, required",
      variantId: "UUID, optional",
      quantity: "Integer, required",
      attributes: "JSON object, optional",
    },
    response: {
      cart: "Cart object",
    },
  },

  // Update cart item
  "PUT /api/cart/items/:id": {
    body: {
      quantity: "Integer, required",
    },
    response: {
      cart: "Cart object",
    },
  },

  // Remove cart item
  "DELETE /api/cart/items/:id": {
    response: {
      cart: "Cart object",
    },
  },

  // Clear cart
  "DELETE /api/cart": {
    response: {
      message: "String",
    },
  },

  // Apply coupon
  "POST /api/cart/coupon": {
    body: {
      code: "String, required",
    },
    response: {
      cart: "Cart object",
    },
  },

  // Remove coupon
  "DELETE /api/cart/coupon": {
    response: {
      cart: "Cart object",
    },
  },
}

/**
 * Order API
 */
const OrderAPI = {
  // Create order
  "POST /api/orders": {
    body: {
      shippingAddressId: "UUID, required",
      billingAddressId: "UUID, optional (defaults to shipping)",
      paymentMethod: "String, required",
      shippingMethod: "String, required",
      notes: "Text, optional",
    },
    response: {
      order: "Order object",
      paymentIntent: "Payment intent object for client-side processing",
    },
  },

  // Get all user orders
  "GET /api/orders": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 10",
      status: "String, optional",
    },
    response: {
      orders: "Array of Order objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Get order by ID
  "GET /api/orders/:id": {
    response: {
      order: "Order object",
    },
  },

  // Cancel order
  "POST /api/orders/:id/cancel": {
    body: {
      reason: "String, optional",
    },
    response: {
      order: "Order object",
    },
  },

  // Process payment webhook
  "POST /api/orders/payment-webhook": {
    body: "Payment provider webhook payload",
    response: {
      message: "String",
    },
  },
}

/**
 * Wishlist API
 */
const WishlistAPI = {
  // Get user wishlists
  "GET /api/wishlists": {
    response: {
      wishlists: "Array of Wishlist objects",
    },
  },

  // Get wishlist by ID
  "GET /api/wishlists/:id": {
    response: {
      wishlist: "Wishlist object",
    },
  },

  // Create wishlist
  "POST /api/wishlists": {
    body: {
      name: "String, required",
      isPublic: "Boolean, optional",
    },
    response: {
      wishlist: "Wishlist object",
    },
  },

  // Update wishlist
  "PUT /api/wishlists/:id": {
    body: {
      name: "String, optional",
      isPublic: "Boolean, optional",
    },
    response: {
      wishlist: "Wishlist object",
    },
  },

  // Delete wishlist
  "DELETE /api/wishlists/:id": {
    response: {
      message: "String",
    },
  },

  // Add item to wishlist
  "POST /api/wishlists/:id/items": {
    body: {
      productId: "UUID, required",
      variantId: "UUID, optional",
    },
    response: {
      wishlist: "Wishlist object",
    },
  },

  // Remove item from wishlist
  "DELETE /api/wishlists/:wishlistId/items/:itemId": {
    response: {
      wishlist: "Wishlist object",
    },
  },

  // Move item to another wishlist
  "POST /api/wishlists/:wishlistId/items/:itemId/move": {
    body: {
      destinationWishlistId: "UUID, required",
    },
    response: {
      wishlist: "Wishlist object",
    },
  },
}

/**
 * Seller API
 */
const SellerAPI = {
  // Register as seller
  "POST /api/seller/register": {
    body: {
      storeName: "String, required",
      storeDescription: "Text, optional",
      contactEmail: "String, required",
      contactPhone: "String, optional",
      address: "Address object",
    },
    response: {
      sellerProfile: "SellerProfile object",
    },
  },

  // Get seller profile
  "GET /api/seller/profile": {
    response: {
      sellerProfile: "SellerProfile object",
    },
  },

  // Update seller profile
  "PUT /api/seller/profile": {
    body: "SellerProfile object (without id)",
    response: {
      sellerProfile: "SellerProfile object",
    },
  },

  // Get seller products
  "GET /api/seller/products": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      sort: "String, default: 'createdAt:desc'",
      status: "String, optional",
      search: "String, optional",
    },
    response: {
      products: "Array of Product objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Create product
  "POST /api/seller/products": {
    body: "Product object (without id)",
    response: {
      product: "Product object",
    },
  },

  // Update product
  "PUT /api/seller/products/:id": {
    body: "Product object (without id)",
    response: {
      product: "Product object",
    },
  },

  // Delete product
  "DELETE /api/seller/products/:id": {
    response: {
      message: "String",
    },
  },

  // Get seller orders
  "GET /api/seller/orders": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      status: "String, optional",
      search: "String, optional",
    },
    response: {
      orders: "Array of Order objects",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Get seller order details
  "GET /api/seller/orders/:id": {
    response: {
      order: "Order object",
    },
  },

  // Update order status
  "PUT /api/seller/orders/:id/status": {
    body: {
      status: "Enum (processing, shipped, delivered)",
      trackingNumber: "String, optional",
      notes: "String, optional",
    },
    response: {
      order: "Order object",
    },
  },

  // Get seller dashboard stats
  "GET /api/seller/dashboard/stats": {
    query: {
      period: "Enum (today, week, month, year), default: week",
    },
    response: {
      stats: {
        revenue: "Decimal",
        orders: "Integer",
        products: "Integer",
        customers: "Integer",
        averageOrderValue: "Decimal",
        topProducts: "Array of Product objects with sales data",
        recentOrders: "Array of Order objects",
        salesByDay: "Array of daily sales data",
      },
    },
  },
}

/**
 * Search API
 */
const SearchAPI = {
  // Search products
  "GET /api/search": {
    query: {
      q: "String, required",
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      category: "String, optional",
      minPrice: "Decimal, optional",
      maxPrice: "Decimal, optional",
      sort: "String, default: 'relevance'",
    },
    response: {
      products: "Array of Product objects",
      categories: "Array of Category objects with match count",
      suggestions: "Array of search term suggestions",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Get search suggestions
  "GET /api/search/suggestions": {
    query: {
      q: "String, required",
      limit: "Integer, default: 5",
    },
    response: {
      suggestions: "Array of search term suggestions",
    },
  },
}

/**
 * Notification API
 */
const NotificationAPI = {
  // Get user notifications
  "GET /api/notifications": {
    query: {
      page: "Integer, default: 1",
      limit: "Integer, default: 20",
      unreadOnly: "Boolean, default: false",
    },
    response: {
      notifications: "Array of Notification objects",
      unreadCount: "Integer",
      pagination: {
        page: "Integer",
        limit: "Integer",
        totalItems: "Integer",
        totalPages: "Integer",
      },
    },
  },

  // Mark notification as read
  "PUT /api/notifications/:id/read": {
    response: {
      notification: "Notification object",
    },
  },

  // Mark all notifications as read
  "PUT /api/notifications/read-all": {
    response: {
      message: "String",
    },
  },
}

// =============================================
// IMPLEMENTATION NOTES
// =============================================

/**
 * Authentication Implementation
 *
 * - Use JWT for authentication with short-lived access tokens and longer-lived refresh tokens
 * - Implement rate limiting for login attempts to prevent brute force attacks
 * - Store passwords using bcrypt or Argon2 with appropriate salt rounds
 * - Implement email verification for new accounts
 * - Use HTTPS for all API endpoints
 */

/**
 * Database Implementation
 *
 * - Use PostgreSQL for relational data with UUID primary keys
 * - Consider using Redis for caching frequently accessed data (product listings, etc.)
 * - Implement database indexing for frequently queried fields
 * - Use database transactions for operations that modify multiple tables
 * - Implement soft deletes for most entities to preserve data integrity
 */

/**
 * API Implementation
 *
 * - Implement proper error handling with appropriate HTTP status codes
 * - Use pagination for all list endpoints to limit response size
 * - Implement request validation using a schema validation library
 * - Use query parameters for filtering and sorting
 * - Implement proper CORS configuration
 * - Add rate limiting for public endpoints
 */

/**
 * Performance Considerations
 *
 * - Implement caching for product listings and category trees
 * - Use CDN for serving static assets (images, etc.)
 * - Implement database query optimization
 * - Consider implementing server-side rendering or static generation for product pages
 * - Use image optimization for product images
 */

/**
 * Security Considerations
 *
 * - Implement input validation for all API endpoints
 * - Use parameterized queries to prevent SQL injection
 * - Implement CSRF protection for authenticated endpoints
 * - Use Content Security Policy headers
 * - Implement proper access control checks for all endpoints
 * - Regular security audits and vulnerability scanning
 */

// Export the schemas and API endpoints for reference
module.exports = {
  // Database Schemas
  Schemas: {
    UserSchema,
    AddressSchema,
    ProductSchema,
    ProductVariantSchema,
    CategorySchema,
    CartSchema,
    CartItemSchema,
    OrderSchema,
    OrderItemSchema,
    ReviewSchema,
    WishlistSchema,
    WishlistItemSchema,
    CouponSchema,
    SellerProfileSchema,
    NotificationSchema,
  },

  // API Endpoints
  APIs: {
    AuthAPI,
    UserAPI,
    ProductAPI,
    CategoryAPI,
    CartAPI,
    OrderAPI,
    WishlistAPI,
    SellerAPI,
    SearchAPI,
    NotificationAPI,
  },
}
