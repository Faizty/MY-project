"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { getNotifications } from "@/lib/api"

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
})

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()
        setNotifications(data || [])
        setUnreadCount(data?.length || 0)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Refresh notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000)
    return () => clearInterval(intervalId)
  }, [isAuthenticated])

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
