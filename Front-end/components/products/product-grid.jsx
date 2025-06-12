"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getProducts } from "@/lib/api"
import { Loader2 } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowDownUp, Star, Clock } from "lucide-react"

export default function ProductGrid({ filters, searchQuery }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("newest")

  // Get sort from URL only once
  useEffect(() => {
    const sort = searchParams.get("sort") || "newest"
    setSortBy(sort)
  }, [searchParams])

  // Fetch all products once on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true)
      try {
        console.log("🔄 Fetching all products from API...")
        // Fetch all products without any filters
        const products = await getProducts()
        console.log("✅ Fetched", products.length, "products")
        setAllProducts(products)
        setFilteredProducts(products) // Initially show all products
        setError(null)
      } catch (error) {
        console.error("❌ Error fetching products:", error)
        setError("Failed to load products. Please try again.")
        setAllProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  // Apply client-side filtering whenever filters or search query changes
  useEffect(() => {
    if (allProducts.length === 0) return

    console.log("🔍 Applying filters:", filters)
    console.log("🔍 Search query:", searchQuery)

    let filtered = [...allProducts]

    // Apply search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query)),
      )
    }

    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.some(
          (category) => product.category && product.category.toLowerCase() === category.toLowerCase(),
        ),
      )
    }

    // Apply brand filter
    if (filters?.brands && filters.brands.length > 0) {
      filtered = filtered.filter((product) => filters.brands.includes(product.brand))
    }

    // Apply color filter
    if (filters?.colors && filters.colors.length > 0) {
      filtered = filtered.filter(
        (product) => product.colors && product.colors.some((color) => filters.colors.includes(color)),
      )
    }

    // Apply price range filter
    if (filters?.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)) {
      filtered = filtered.filter((product) => {
        const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price

        return price >= filters.priceRange[0] && price <= filters.priceRange[1]
      })
    }

    // Apply rating filter
    if (filters?.ratings && filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings)
      filtered = filtered.filter((product) => product.rating >= minRating)
    }

    // Apply stock filter
    if (filters?.inStock) {
      filtered = filtered.filter((product) => product.stock > 0)
    }

    // Apply sale filter
    if (filters?.onSale) {
      filtered = filtered.filter((product) => product.discount > 0)
    }

    console.log("✅ Filtered products:", filtered.length, "out of", allProducts.length)
    setFilteredProducts(filtered)
  }, [allProducts, filters, searchQuery])

  // Apply sorting whenever sort option or filtered products change
  const sortedProducts = useMemo(() => {
    if (!filteredProducts.length) return []

    const sorted = [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price
          const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price
          return priceA - priceB
        case "price_desc":
          const priceA2 = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price
          const priceB2 = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price
          return priceB2 - priceA2
        case "popularity":
          return b.rating - a.rating
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })

    console.log("🔄 Sorted products by:", sortBy)
    return sorted
  }, [filteredProducts, sortBy])

  // Function to update sort parameter in URL
  const handleSortChange = (value) => {
    setSortBy(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }

    // Update URL without navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, "", newUrl)
  }

  // Get the sort icon based on current sort
  const getSortIcon = (sortValue) => {
    switch (sortValue) {
      case "price_asc":
        return <ArrowUpDown className="h-4 w-4 mr-2" />
      case "price_desc":
        return <ArrowDownUp className="h-4 w-4 mr-2" />
      case "popularity":
        return <Star className="h-4 w-4 mr-2" />
      case "newest":
      default:
        return <Clock className="h-4 w-4 mr-2" />
    }
  }

  // Get the sort label based on current sort
  const getSortLabel = (sortValue) => {
    switch (sortValue) {
      case "price_asc":
        return "Price: Low to High"
      case "price_desc":
        return "Price: High to Low"
      case "popularity":
        return "Popularity"
      case "newest":
      default:
        return "Newest"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-brand-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center dark:border-gray-700">
        <h3 className="mb-2 text-xl font-semibold dark:text-white">Error</h3>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort and Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">{sortedProducts.length}</span> results
          {allProducts.length > 0 && <span className="ml-1">of {allProducts.length} total products</span>}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium dark:text-white">Sort by:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>
                <div className="flex items-center">
                  {getSortIcon(sortBy)}
                  <span>{getSortLabel(sortBy)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Newest</span>
                </div>
              </SelectItem>
              <SelectItem value="popularity">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Popularity</span>
                </div>
              </SelectItem>
              <SelectItem value="price_asc">
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span>Price: Low to High</span>
                </div>
              </SelectItem>
              <SelectItem value="price_desc">
                <div className="flex items-center">
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  <span>Price: High to Low</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Sort Buttons */}
      <div className="flex md:hidden overflow-x-auto pb-2 gap-2">
        <Button
          variant={sortBy === "newest" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("newest")}
          className="flex items-center whitespace-nowrap"
        >
          <Clock className="h-4 w-4 mr-1" />
          <span>Newest</span>
        </Button>
        <Button
          variant={sortBy === "popularity" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("popularity")}
          className="flex items-center whitespace-nowrap"
        >
          <Star className="h-4 w-4 mr-1" />
          <span>Popular</span>
        </Button>
        <Button
          variant={sortBy === "price_asc" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("price_asc")}
          className="flex items-center whitespace-nowrap"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          <span>Price: Low to High</span>
        </Button>
        <Button
          variant={sortBy === "price_desc" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("price_desc")}
          className="flex items-center whitespace-nowrap"
        >
          <ArrowDownUp className="h-4 w-4 mr-1" />
          <span>Price: High to Low</span>
        </Button>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center dark:border-gray-700">
          <h3 className="mb-2 text-xl font-semibold dark:text-white">No products found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {allProducts.length === 0
              ? "No products available at the moment."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
