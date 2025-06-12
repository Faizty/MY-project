"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Clock, Trash2 } from "lucide-react"

export default function SearchHistory({ onSelect }) {
  const [recentSearches, setRecentSearches] = useState([])
  const router = useRouter()

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const loadSearchHistory = () => {
      const savedSearches = localStorage.getItem("recentSearches")
      if (savedSearches) {
        try {
          setRecentSearches(JSON.parse(savedSearches))
        } catch (error) {
          console.error("Error parsing recent searches:", error)
          // Initialize with empty array if parsing fails
          localStorage.setItem("recentSearches", JSON.stringify([]))
        }
      } else {
        // Initialize localStorage if it doesn't exist
        localStorage.setItem("recentSearches", JSON.stringify([]))
      }
    }

    loadSearchHistory()
  }, []) // Empty dependency array to run only once on mount

  const handleSelectSearch = (term) => {
    // Update recent searches when a term is selected
    const updatedSearches = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))

    if (onSelect) {
      onSelect(term)
    } else {
      router.push(`/products?q=${encodeURIComponent(term)}`)
    }
  }

  const handleRemoveSearch = (e, index) => {
    e.stopPropagation()
    const updatedSearches = [...recentSearches]
    updatedSearches.splice(index, 1)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  const clearAllSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  if (recentSearches.length === 0) {
    return null
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 py-1">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="mr-1 h-3 w-3" />
          <span>Recent Searches</span>
        </div>
        <button
          onClick={clearAllSearches}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-1 space-y-1 px-1">
        {recentSearches.map((term, index) => (
          <div key={index} className="search-history-item" onClick={() => handleSelectSearch(term)}>
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <span className="text-sm">{term}</span>
            </div>
            <button
              onClick={(e) => handleRemoveSearch(e, index)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
