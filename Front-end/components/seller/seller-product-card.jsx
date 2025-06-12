"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Edit, MoreVertical, Trash } from "lucide-react"

export default function SellerProductCard({ product, onDelete }) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/seller/products/edit/${product.id}`)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(product.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="relative aspect-square overflow-hidden">
        <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-1 font-semibold hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">Stock: {product.stock || 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
          <span>{new Date(product.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{product.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
