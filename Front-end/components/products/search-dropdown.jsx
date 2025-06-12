"use client"

// components/products/search-dropdown.jsx
import { useState, useRef } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SearchDropdown = ({ onClose }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef(null)

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${query}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(query)
    }
  }

  return (
    <div className="p-4 dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="pl-9 pr-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={() => handleSearch(query)}>Search</Button>
      </div>

      {/* Update the search results styling */}
      <div className="max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">Searching...</div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Products</h3>
            {results.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  router.push(`/products/${product.id}`)
                  onClose()
                }}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-md border dark:border-gray-600">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover dark:brightness-90"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">{product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No products found</div>
        ) : null}
      </div>
    </div>
  )
}

export default SearchDropdown
