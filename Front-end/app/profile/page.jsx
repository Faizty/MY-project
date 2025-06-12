"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, uploadAvatar, getUserAvatar } from "@/lib/api"
import { Loader2, Camera, User, Mail, Phone, MapPin, FileText, Package, X } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, updateUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  })

  const [avatarUrl, setAvatarUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      })

      // Fetch existing avatar on page load
      fetchUserAvatar()
    }
  }, [isLoading, isAuthenticated, router, user])

  // Fetch user's existing avatar
  const fetchUserAvatar = async () => {
    if (!user?.id) return

    try {
      const response = await getUserAvatar(user.id)
      if (response.success && response.avatarData) {
        // Convert binary data to base64 URL
        const base64 = btoa(
          new Uint8Array(response.avatarData).reduce((data, byte) => data + String.fromCharCode(byte), ""),
        )
        const avatarDataUrl = `data:image/jpeg;base64,${base64}`
        setAvatarUrl(avatarDataUrl)
      }
    } catch (error) {
      console.error("Error fetching avatar:", error)
      // If avatar fetch fails, it's not critical - user just won't see existing avatar
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
      }

      const response = await updateUserProfile(updateData)

      if (response.success && response.user) {
        updateUser(response.user)

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(response.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, etc.).",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    // Set selected file and create preview
    setSelectedFile(file)

    // Create preview URL
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    toast({
      title: "Image selected",
      description: "Click 'Upload Avatar' to save your new profile picture.",
    })
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("avatar", selectedFile)

      const response = await uploadAvatar(formData)

      if (response.success) {
        // Fetch the updated avatar
        await fetchUserAvatar()

        // Clear preview and selected file
        clearPreview()

        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated successfully.",
        })

        // Update user context if response contains user data
        if (response.user) {
          updateUser(response.user)
        }
      } else {
        throw new Error(response.error || "Failed to upload avatar")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl) 
    }
    setPreviewUrl("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const navigateToOrders = () => {
    router.push("/orders")
  }

  
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-6 flex flex-col items-center">
              {/* Avatar Display */}
              <div className="relative mb-4">
                <div
                  className="profile-avatar-upload relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600"
                  onClick={handleAvatarClick}
                >
                  {previewUrl ? (
                    // Show preview if file is selected
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : avatarUrl ? (
                    // Show existing avatar
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt="Current avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // Show placeholder
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="profile-avatar-overlay absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>

                {/* Clear preview button */}
                {previewUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearPreview()
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploadingAvatar}
              />

              {/* Upload Button */}
              {selectedFile && (
                <Button onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="mb-4" size="sm">
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Avatar"
                  )}
                </Button>
              )}

              <h2 className="text-xl font-bold dark:text-white">{formData.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{formData.email}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user?.role === "seller" ? "Seller Account" : "Customer Account"}
              </p>

              {/* Upload Status */}
              {isUploadingAvatar && (
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">Uploading avatar...</p>
              )}
              {selectedFile && !isUploadingAvatar && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400">Ready to upload: {selectedFile.name}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium dark:text-white">Email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formData.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium dark:text-white">Phone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formData.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium dark:text-white">Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formData.address || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium dark:text-white">Bio</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formData.bio || "No bio provided"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={navigateToOrders}
              >
                <Package className="h-5 w-5" />
                My Orders
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-6 text-xl font-bold dark:text-white">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium dark:text-white">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium dark:text-white">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium dark:text-white">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-medium dark:text-white">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="mb-2 block text-sm font-medium dark:text-white">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="min-h-32 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
