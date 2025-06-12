"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/api"
import ProductCard from "@/components/products/product-card"

export default function TrendingProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrendingProducts() {
      try {
        // Get more products and randomly select 4 to avoid duplication with featured
        const data = await getProducts({ limit: 12 })

        // Randomly shuffle and select 4 products
        const shuffled = data.sort(() => 0.5 - Math.random())
        const randomProducts = shuffled.slice(0, 4)

        setProducts(randomProducts)
      } catch (error) {
        console.error("Error loading trending products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrendingProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">Trending Now</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-4">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="mb-4 h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="mb-4 h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-9 animate-pulse rounded bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Trending Now</h2>
        <Link href="/products?sort=trending">
          <Button variant="ghost" className="gap-2">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
