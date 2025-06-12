"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getProductById, updateProduct } from "@/lib/api"
import { Loader2, Upload, X, Plus, Minus, Link, ImageIcon, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EditProductPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)
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

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        console.log("Fetching product with ID:", params.id)

        const productData = await getProductById(params.id)

        if (!productData) {
          toast({
            title: "Product not found",
            description: "The product you're trying to edit doesn't exist.",
            variant: "destructive",
          })
          router.push("/seller/dashboard")
          return
        }

        console.log("Fetched product data:", productData)
        setProduct(productData)

        // Pre-fill form data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          fullDescription: productData.fullDescription || "",
          price: productData.price ? productData.price.toString() : "",
          discount: productData.discount ? productData.discount.toString() : "0",
          category: productData.category || "",
          brand: productData.brand || "",
          stock: productData.stock ? productData.stock.toString() : "",
        })

        // Pre-fill image URLs
        if (productData.images && Array.isArray(productData.images)) {
          setImageUrls(productData.images.filter((url) => url && url !== "/placeholder.svg"))
        } else if (productData.image && productData.image !== "/placeholder.svg") {
          setImageUrls([productData.image])
        }

        // Pre-fill specifications
        if (
          productData.specifications &&
          Array.isArray(productData.specifications) &&
          productData.specifications.length > 0
        ) {
          setSpecifications(
            productData.specifications.map((spec) => ({
              name: spec.name || "",
              value: spec.value || "",
            })),
          )
        } else {
          setSpecifications([{ name: "", value: "" }])
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        })
        router.push("/seller/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAuthenticated && params.id) {
      fetchProduct()
    }
  }, [params.id, authLoading, isAuthenticated, router, toast])

  // Check authentication and authorization
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/seller/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Check if user owns this product
  useEffect(() => {
    if (product && user && product.seller) {
      // Check if the current user is the seller of this product
      const productSellerId = product.seller.id || product.seller_id
      const currentUserId = user.id

      console.log("Product seller ID:", productSellerId)
      console.log("Current user ID:", currentUserId)
      console.log("Product seller:", product.seller)

      if (String(productSellerId) !== String(currentUserId)) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own products.",
          variant: "destructive",
        })
        router.push("/seller/dashboard")
        return
      }
    }
  }, [product, user, router, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Image URL management
  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && imageUrls.length < 6) {
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
      if (!product?.id) throw new Error("Product ID not found")

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

      // Format data according to your API structure
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        price: Number.parseFloat(formData.price),
        discount: Number.parseFloat(formData.discount) || 0,
        image: imageUrls[0] || "/placeholder.svg?height=300&width=300",
        images: imageUrls.length > 0 ? imageUrls : ["/placeholder.svg?height=300&width=300"],
        category: formData.category,
        brand: formData.brand.trim(),
        stock: Number.parseInt(formData.stock),
        specifications: validSpecifications,
        seller_id: Number(user.id) || 1,
      }

      console.log("=== UPDATE PRODUCT REQUEST ===")
      console.log("Product ID:", product.id)
      console.log("Update data:", JSON.stringify(updateData, null, 2))
      console.log("=== END REQUEST ===")

      await updateProduct(product.id, updateData)

      toast({
        title: "Product updated successfully!",
        description: "Your product has been updated in the catalog.",
      })
      router.push("/seller/dashboard")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !product) {
    return null // Router will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/seller/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-600">Update your product details below</p>
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
                Add up to 6 high-quality image URLs. First image will be the main product image.
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
                Updating Product...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Update Product
              </>
            )}
          </Button>

          {/* Current Product Info */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Current Product</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {product.id}
              </p>
              <p>
                <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Rating:</strong> {product.rating}/5 ({product.reviews} reviews)
              </p>
              <p>
                <strong>Current Stock:</strong> {product.stock} units
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-bold">Updated Preview</h2>
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
