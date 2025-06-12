"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getNotifications } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export default function NotificationsDropdown() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      try {
        const data = await getNotifications()
        setNotifications(data || [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-sm text-gray-500">Please log in to view notifications</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Notifications</h3>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : notifications.length > 0 ? (
        <ScrollArea className="h-[300px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Bell className="h-6 w-6 text-gray-500" />
          </div>
          <p className="mt-3 text-sm font-medium">No notifications</p>
          <p className="mt-1 text-xs text-gray-500">You don't have any notifications at the moment.</p>
        </div>
      )}
    </div>
  )
}
