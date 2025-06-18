"use client"

import { createContext, useState, useContext, useCallback } from "react"
import { useId } from "@reach/auto-id"

/**
 * @typedef {Object} Toast
 * @property {string} id - The unique ID of the toast.
 * @property {string} title - The title of the toast.
 * @property {string} description - The description of the toast.
 * @property {string} action - The action to display on the toast.
 * @property {function} onActionClick - The function to call when the action is clicked.
 * @property {string} variant - The variant of the toast (e.g., "default", "destructive").
 * @property {number} duration - The duration the toast is displayed in milliseconds.
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {(toast: Omit<Toast, 'id'>) => void} toast - Function to add a toast.
 * @property {(id: string) => void} dismiss - Function to dismiss a toast.
 * @property {(id: string) => void} update - Function to update a toast.
 * @property {Toast[]} toasts - Array of active toasts.
 */

const ToastContext = createContext(/** @type {ToastContextValue} */ {})

/**
 * @returns {ToastContextValue}
 */
const useToastContext = () => useContext(ToastContext)

/**
 * @param {{ children: React.ReactNode }} props
 */
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  /**
   * @param {Omit<Toast, 'id'>} newToast
   */
  const toast = (newToast) => {
    const id = useId()
    setToasts((prevToasts) => [...prevToasts, { id, ...newToast }])
  }

  /**
   * @param {string} id
   */
  const dismiss = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  /**
   * @param {string} id
   */
  const update = (id, toastProps) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...toastProps } : t)))
  }

  return <ToastContext.Provider value={{ toasts, toast, dismiss, update }}>{children}</ToastContext.Provider>
}

/**
 * @returns {{ toast: (toast: Omit<Toast, 'id'>) => void, dismiss: (id: string) => void, update: (id: string, toastProps: Partial<Toast>) => void, toasts: Toast[] }}
 */
function useToast() {
  const { toasts, toast, dismiss, update } = useToastContext()

  const toaster = useCallback(
    (/** @type {Omit<Toast, 'id'>} */ props) => {
      toast(props)
    },
    [toast],
  )

  const dismissToast = useCallback(
    (/** @type {string} */ key) => {
      dismiss(key)
    },
    [dismiss],
  )

  const updateToast = useCallback(
    (/** @type {string} */ id, /** @type {Partial<Toast>} */ toastProps) => {
      update(id, toastProps)
    },
    [update],
  )

  return {
    toast: toaster,
    dismiss: dismissToast,
    update: updateToast,
    toasts,
  }
}

export { ToastProvider, useToast, useToastContext }
