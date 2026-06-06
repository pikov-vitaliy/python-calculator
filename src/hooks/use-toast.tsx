"use client"

import * as React from "react"
import type { ToastActionElement } from "@/components/ui/toast"

interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  promise?: Promise<any>
  dismissible?: boolean
  variant?: "default" | "destructive"
}

interface ToastState {
  toasts: ToastProps[]
  addToast: (toast: ToastProps) => string
  dismissToast: (id: string) => void
  updateToast: (id: string, updates: Partial<ToastProps>) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastState | null>(null)

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback(
    (toast: ToastProps) => {
      const id = toast.id || Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { ...toast, id }])
      return id
    },
    []
  )

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = React.useCallback(
    (id: string, updates: Partial<ToastProps>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      )
    },
    []
  )

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = React.useMemo(
    () => ({
      toasts,
      addToast,
      dismissToast,
      updateToast,
      clearToasts,
    }),
    [toasts, addToast, dismissToast, updateToast, clearToasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

export { ToastProvider }
