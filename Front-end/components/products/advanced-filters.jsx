"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getAllBrands } from "@/lib/api"
import { X, Filter, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function AdvancedFilters({ onFiltersChange }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialLoadComplete = useRef(false)

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [ratings, setRatings] = useState([])
  const [availability, setAvailability] = useState(false)
  const [onSale, setOnSale] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch categories, brands, and colors on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch categories from API
        const categoriesData = [
          "smartphones",
          "laptops",
          "audio",
          "wearables",
          "accessories",
          "gaming",
          "cameras",
          "televisions",
          "tablets",
          "home-appliances",
        ]
        setCategories(categoriesData)

        // Get all available brands
        const brandsData = getAllBrands()
        setBrands(brandsData)
      } catch (error) {
        console.error("Error fetching filter data:", error)
      }
    }

    fetchFilterData()
  }, [])

  // Initialize filters from URL only once
  useEffect(() => {
    if (initialLoadComplete.current) return

    // Initialize filters from URL
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","))
    }

    // Parse brands
    const brandsParam = searchParams.get("brands")
    if (brandsParam) {
      setSelectedBrands(brandsParam.split(","))
    }

    // Parse price range
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)])
    }

    // Parse ratings
    const ratingsParam = searchParams.get("ratings")
    if (ratingsParam) {
      setRatings(ratingsParam.split(",").map(Number))
    }

    // Parse availability
    const availabilityParam = searchParams.get("inStock")
    if (availabilityParam === "true") {
      setAvailability(true)
    }

    // Parse sale items
    const saleParam = searchParams.get("onSale")
    if (saleParam === "true") {
      setOnSale(true)
    }

    initialLoadComplete.current = true

    // Update active filters after initializing
    setTimeout(() => {
      updateActiveFilters()
    }, 0)
  }, [searchParams])

  // Update active filters when filter states change
  useEffect(() => {
    if (!initialLoadComplete.current) return
    updateActiveFilters()
  }, [selectedCategories, selectedBrands, priceRange, ratings, availability, onSale])

  // Move updateActiveFilters outside of useEffect to avoid dependency issues
  const updateActiveFilters = () => {
    const filters = []

    if (selectedCategories.length > 0) {
      selectedCategories.forEach((cat) => filters.push({ type: "category", value: cat, label: `Category: ${cat}` }))
    }

    if (selectedBrands.length > 0) {
      selectedBrands.forEach((brand) => filters.push({ type: "brand", value: brand, label: `Brand: ${brand}` }))
    }

    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      filters.push({
        type: "price",
        value: priceRange,
        label: `Price: $${priceRange[0]} - $${priceRange[1]}`,
      })
    }

    if (ratings.length > 0) {
      ratings.forEach((rating) => filters.push({ type: "rating", value: rating, label: `${rating}★ & Up` }))
    }

    if (availability) {
      filters.push({ type: "availability", value: true, label: "In Stock Only" })
    }

    if (onSale) {
      filters.push({ type: "sale", value: true, label: "On Sale" })
    }

    setActiveFilters(filters)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const handleRatingChange = (rating) => {
    setRatings((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const removeFilter = (filter) => {
    switch (filter.type) {
      case "category":
        setSelectedCategories((prev) => prev.filter((c) => c !== filter.value))
        break
      case "brand":
        setSelectedBrands((prev) => prev.filter((b) => b !== filter.value))
        break
      case "price":
        setPriceRange([0, 5000])
        break
      case "rating":
        setRatings((prev) => prev.filter((r) => r !== filter.value))
        break
      case "availability":
        setAvailability(false)
        break
      case "sale":
        setOnSale(false)
        break
    }
  }

  const applyFilters = () => {
    // Create filter object to pass to parent component
    const filterCriteria = {
      categories: selectedCategories,
      brands: selectedBrands,
      priceRange: priceRange,
      ratings: ratings,
      inStock: availability,
      onSale: onSale,
    }

    console.log("🔍 Applying filters:", filterCriteria)

    // Update URL parameters for bookmarking/sharing
    const params = new URLSearchParams(searchParams.toString())

    // Update category parameter
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    } else {
      params.delete("category")
    }

    // Update brands parameter
    if (selectedBrands.length > 0) {
      params.set("brands", selectedBrands.join(","))
    } else {
      params.delete("brands")
    }

    // Update price range
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      params.set("minPrice", priceRange[0].toString())
      params.set("maxPrice", priceRange[1].toString())
    } else {
      params.delete("minPrice")
      params.delete("maxPrice")
    }

    // Update ratings
    if (ratings.length > 0) {
      params.set("ratings", ratings.join(","))
    } else {
      params.delete("ratings")
    }

    // Update availability
    if (availability) {
      params.set("inStock", "true")
    } else {
      params.delete("inStock")
    }

    // Update sale items
    if (onSale) {
      params.set("onSale", "true")
    } else {
      params.delete("onSale")
    }

    // Preserve search query if exists
    const query = searchParams.get("q")
    if (query) {
      params.set("q", query)
    }

    // Preserve sort if exists
    const sort = searchParams.get("sort")
    if (sort) {
      params.set("sort", sort)
    }

    // Update URL without navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, "", newUrl)

    // Close mobile filter sheet
    setIsFilterOpen(false)

    // Call parent component's filter handler
    if (onFiltersChange) {
      onFiltersChange(filterCriteria)
    }
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 5000])
    setRatings([])
    setAvailability(false)
    setOnSale(false)

    // Clear URL parameters except search query and sort
    const params = new URLSearchParams()

    const query = searchParams.get("q")
    if (query) {
      params.set("q", query)
    }

    const sort = searchParams.get("sort")
    if (sort) {
      params.set("sort", sort)
    }

    // Update URL without navigation
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
    window.history.pushState({}, "", newUrl)

    // Call parent component's filter handler with empty filters
    if (onFiltersChange) {
      onFiltersChange({
        categories: [],
        brands: [],
        priceRange: [0, 5000],
        ratings: [],
        inStock: false,
        onSale: false,
      })
    }
  }

  const filterContent = (
    <>
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={["categories", "brands", "price", "rating", "other"]}>
          <AccordionItem value="categories" className="border-b dark:border-gray-700">
            <AccordionTrigger className="text-base font-medium dark:text-white">Categories</AccordionTrigger>
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

          <AccordionItem value="brands" className="border-b dark:border-gray-700">
            <AccordionTrigger className="text-base font-medium dark:text-white">Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => handleBrandChange(brand)}
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price" className="border-b dark:border-gray-700">
            <AccordionTrigger className="text-base font-medium dark:text-white">Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newValue = Number(e.target.value)
                        if (newValue >= 0 && newValue <= priceRange[1]) {
                          setPriceRange([newValue, priceRange[1]])
                        }
                      }}
                      className="h-8 w-20"
                    />
                  </div>
                  <span className="text-sm">to</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      min={priceRange[0]}
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newValue = Number(e.target.value)
                        if (newValue >= priceRange[0] && newValue <= 10000) {
                          setPriceRange([priceRange[0], newValue])
                        }
                      }}
                      className="h-8 w-20"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating" className="border-b dark:border-gray-700">
            <AccordionTrigger className="text-base font-medium dark:text-white">Rating</AccordionTrigger>
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

          <AccordionItem value="other" className="border-b dark:border-gray-700">
            <AccordionTrigger className="text-base font-medium dark:text-white">Other Filters</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="in-stock" checked={availability} onCheckedChange={setAvailability} />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                  >
                    In Stock Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="on-sale" checked={onSale} onCheckedChange={setOnSale} />
                  <label
                    htmlFor="on-sale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                  >
                    On Sale
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={resetFilters} className="flex-1 dark:border-gray-600 dark:text-gray-300">
          Reset All
        </Button>
      </div>
    </>
  )

  return (
    <div className="mb-6">
      {/* Mobile Filter Button */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h2 className="text-lg font-semibold dark:text-white">Filters</h2>
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 dark:border-gray-600 dark:text-gray-300">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{activeFilters.length}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search with multiple filters</SheetDescription>
            </SheetHeader>
            <div className="py-4">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
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

        {filterContent}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-medium">Active Filters:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1 dark:border-gray-600">
                <span className="text-xs">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
