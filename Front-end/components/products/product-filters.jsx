"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCategories } from "@/lib/api"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [ratings, setRatings] = useState([])

  useEffect(() => {
    // Initialize filters from URL
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [searchParams])

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleRatingChange = (rating) => {
    setRatings((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update category parameter
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories[0]) // For simplicity, just use the first selected category
    } else {
      params.delete("category")
    }

    // Update price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Update ratings
    if (ratings.length > 0) {
      params.set("ratings", ratings.join(","))
    } else {
      params.delete("ratings")
    }

    // Preserve search query if exists
    const query = searchParams.get("q")
    if (query) {
      params.set("q", query)
    }

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setRatings([])

    // Preserve only search query if exists
    const query = searchParams.get("q")
    if (query) {
      router.push(`/products?q=${query}`)
    } else {
      router.push("/products")
    }
  }

  return (
    <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-brand-400"
        >
          Reset All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "rating"]}>
        <AccordionItem value="categories" className="dark:border-gray-700">
          <AccordionTrigger className="dark:text-white">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider defaultValue={[0, 1000]} max={1000} step={10} value={priceRange} onValueChange={setPriceRange} />
              <div className="flex items-center justify-between">
                <span className="text-sm">${priceRange[0]}</span>
                <span className="text-sm">${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={ratings.includes(rating)}
                    onCheckedChange={() => handleRatingChange(rating)}
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {Array.from({ length: rating }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-amber-500"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span className="ml-1">& Up</span>
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={applyFilters} className="mt-4 w-full dark:bg-brand-500 dark:hover:bg-brand-600">
        Apply Filters
      </Button>
    </div>
  )
}
