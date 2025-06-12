"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import ProductGrid from "@/components/products/product-grid"
import AdvancedFilters from "@/components/products/advanced-filters"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    colors: [],
    priceRange: [0, 10000],
    ratings: [],
    inStock: false,
    onSale: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const initialLoadDone = useRef(false)

  // Initialize search query and filters from URL only once on initial load
  useEffect(() => {
    if (initialLoadDone.current) return

    const query = searchParams.get("q") || ""
    setSearchQuery(query)

    const categoryParam = searchParams.get("category")
    const brandsParam = searchParams.get("brands")
    const colorsParam = searchParams.get("colors")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const ratingsParam = searchParams.get("ratings")
    const inStockParam = searchParams.get("inStock")
    const onSaleParam = searchParams.get("onSale")

    setFilters({
      categories: categoryParam ? categoryParam.split(",") : [],
      brands: brandsParam ? brandsParam.split(",") : [],
      colors: colorsParam ? colorsParam.split(",") : [],
      priceRange: [minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 1000],
      ratings: ratingsParam ? ratingsParam.split(",").map(Number) : [],
      inStock: inStockParam === "true",
      onSale: onSaleParam === "true",
    })

    initialLoadDone.current = true
  }, [searchParams])

  const handleFiltersChange = (newFilters) => {
    console.log("📝 Filters updated:", newFilters)
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Products</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Discover our wide range of high-quality products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <AdvancedFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid filters={filters} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  )
}
