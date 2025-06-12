"use client"

import { useState, useEffect } from "react"
import { getRelatedProducts } from "@/lib/api"
import ProductCard from "@/components/products/product-card"

export default function RelatedProducts({ productId, category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelatedProducts() {
      try {
        console.log(`Loading related products for product ID: ${productId}, category: ${category}`)
        const data = await getRelatedProducts(productId, category)
        console.log("Related products loaded:", data)
        setProducts(data)
      } catch (error) {
        console.error("Error loading related products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId && category) {
      loadRelatedProducts()
    } else {
      setLoading(false)
    }
  }, [productId, category])

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="mb-6 text-2xl font-bold dark:text-white">You May Also Like</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800">
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

  if (products.length === 0) {
    return null
  }

  return (
    <div className="py-8">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">You May Also Like</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
