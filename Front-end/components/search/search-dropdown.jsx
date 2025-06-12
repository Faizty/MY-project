"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { searchProducts } from "@/lib/api"
import SearchHistory from "@/components/search/search-history"

export default function SearchDropdown({ onClose }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const inputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    // Focus the input when the dropdown opens
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (error) {
        console.error("Error parsing recent searches:", error)
      }
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        try {
          const data = await searchProducts(query)
          setResults(data)
        } catch (error) {
          console.error("Error searching products:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim().length === 0) return

    // Add to recent searches
    const updatedSearches = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)

    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))

    // Navigate to search results page
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(query)
    }
  }

  const handleSelectRecentSearch = (term) => {
    setQuery(term)
    handleSearch(term)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="pl-9 pr-4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={() => handleSearch(query)}>Search</Button>
      </div>

      {/* Recent Searches */}
      {query.length < 2 && <SearchHistory onSelect={handleSelectRecentSearch} />}

      <div className="max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-gray-500">Searching...</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Products</h3>
            {results.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  router.push(`/products/${product.id}`)
                  onClose()
                }}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="py-4 text-center text-sm text-gray-500">No products found</div>
        ) : null}
      </div>
    </div>
  )
}
