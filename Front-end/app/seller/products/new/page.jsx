"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addProduct } from "@/lib/api"
import { Loader2, Upload, X, Plus, Minus, Link, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NewProductPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [specifications, setSpecifications] = useState([{ name: "", value: "" }])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fullDescription: "",
    price: "",
    discount: "0",
    category: "",
    brand: "",
    stock: "",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Image URL management
  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && imageUrls.length < 4) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageUrlKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddImageUrl()
    }
  }

  // Specifications management
  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { name: "", value: "" }])
  }

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      setSpecifications((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const updateSpecification = (index, field, value) => {
    setSpecifications((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user?.id) throw new Error("User not authenticated")

      // Validate required fields
      if (!formData.name.trim()) throw new Error("Product name is required")
      if (!formData.description.trim()) throw new Error("Description is required")
      if (!formData.fullDescription.trim()) throw new Error("Full description is required")
      if (!formData.price || Number.parseFloat(formData.price) <= 0) throw new Error("Valid price is required")
      if (!formData.category) throw new Error("Category is required")
      if (!formData.brand.trim()) throw new Error("Brand is required")
      if (!formData.stock || Number.parseInt(formData.stock) < 0) throw new Error("Valid stock quantity is required")

      // Filter out empty specifications
      const validSpecifications = specifications.filter((spec) => spec.name.trim() && spec.value.trim())

      // Generate unique product ID
      const productId = Date.now() + Math.floor(Math.random() * 1000)

      // Format data according to your API structure
      const productData = {
        id: productId, // Now numeric instead of string
        name: formData.name.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        price: Number.parseFloat(formData.price),
        discount: Number.parseFloat(formData.discount) || 0,
        image: imageUrls[0] || "/placeholder.svg?height=300&width=300",
        images: imageUrls.length > 0 ? imageUrls : ["/placeholder.svg?height=300&width=300"],
        category: formData.category,
        brand: formData.brand.trim(),
        rating: 0,
        reviews: 0,
        stock: Number.parseInt(formData.stock),
        specifications: validSpecifications,
        seller_id: Number(user.id) || 1,
      }

      console.log("=== USER INFO ===")
      console.log("Current user:", user)
      console.log("User ID:", user?.id)
      console.log("User ID type:", typeof user?.id)
      console.log("=== PRODUCT REQUEST BODY ===")
      console.log(JSON.stringify(productData, null, 2))
      console.log("=== END REQUEST BODY ===")

      console.log("Sending product data:", productData)

      await addProduct(productData)
      toast({
        title: "Product added successfully!",
        description: "Your product has been added to the catalog.",
      })
      router.push("/seller/dashboard")
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-600">Fill in all the details below to list your product</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Product Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Short Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description for product cards"
                  required
                  className="min-h-20"
                />
              </div>

              <div>
                <label htmlFor="fullDescription" className="mb-2 block text-sm font-medium">
                  Full Description *
                </label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  placeholder="Detailed product description for product page"
                  required
                  className="min-h-32"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="price" className="mb-2 block text-sm font-medium">
                    Price ($) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="discount" className="mb-2 block text-sm font-medium">
                    Discount (%)
                  </label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="mb-2 block text-sm font-medium">
                    Stock Quantity *
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smartphones">Smartphones</SelectItem>
                      <SelectItem value="laptops">Laptops</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="wearables">Wearables</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="cameras">Cameras</SelectItem>
                      <SelectItem value="televisions">Televisions</SelectItem>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="home-appliances">Home Appliances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="brand" className="mb-2 block text-sm font-medium">
                    Brand *
                  </label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Samsung, Apple, Sony"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Technical Specifications</h2>
              <Button type="button" onClick={addSpecification} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Spec
              </Button>
            </div>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Specification name (e.g., Battery Life, RAM, Storage)"
                    value={spec.name}
                    onChange={(e) => updateSpecification(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., 30 hours, 8GB, 256GB SSD)"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    size="sm"
                    variant="outline"
                    disabled={specifications.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add technical specifications like processor, memory, storage, etc.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Images */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Product Images</h2>

            {/* Add Image URL */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Add Image URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={handleImageUrlKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddImageUrl}
                  size="sm"
                  disabled={!newImageUrl.trim() || imageUrls.length >= 6}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add up to 4 high-quality image URLs. First image will be the main product image.
              </p>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative rounded-md border overflow-hidden">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="aspect-square w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=150&width=150&text=Invalid+URL"
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Main
                      </Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {imageUrls.length === 0 && (
                <div className="col-span-2 flex aspect-square items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="mb-2 h-8 w-8" />
                    <span className="text-sm">No images added</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Add Product to Catalog
              </>
            )}
          </Button>

          {/* Tips */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Tips for Success</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Use high-quality image URLs from reliable sources</li>
              <li>• Write detailed descriptions to attract buyers</li>
              <li>• Include all important specifications</li>
              <li>• Set competitive prices based on market research</li>
              <li>• Keep your inventory updated regularly</li>
              <li>• Respond quickly to buyer inquiries</li>
              <li>• Use clear, descriptive product names</li>
            </ul>
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Quick Preview</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {formData.name || "Not set"}
              </p>
              <p>
                <strong>Price:</strong> ${formData.price || "0.00"}
              </p>
              <p>
                <strong>Category:</strong> {formData.category || "Not selected"}
              </p>
              <p>
                <strong>Brand:</strong> {formData.brand || "Not set"}
              </p>
              <p>
                <strong>Stock:</strong> {formData.stock || "0"} units
              </p>
              <p>
                <strong>Images:</strong> {imageUrls.length} added
              </p>
              <p>
                <strong>Specifications:</strong> {specifications.filter((s) => s.name && s.value).length} added
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
