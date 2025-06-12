export interface Product {
  id: string
  name: string
  description: string
  fullDescription: string
  price: number // Storing original price here
  discount: number
  image: string
  images: string[]
  category: string
  brand: string
  rating: number
  reviews: number
  stock: number
  createdAt: string
  seller: string // Storing only the seller ID (transformed from seller_id)
  specifications: Array<{ name: string; value: string }>
  colors?: string[] // Optional, will default to ['Black'] if not provided
  features?: string[] // Optional, will default to [] if not provided
}

export interface Message {
  id: string
  sellerId: string
  buyerId: string
  buyerName: string
  productId: string
  productName?: string
  message: string
  timestamp: string
  isSellerReply: boolean
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  sellerId: string
  sellerName?: string
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  totalPrice: number
  status: "pending" | "accepted" | "cancelled"
  createdAt: string
  updatedAt: string
}
