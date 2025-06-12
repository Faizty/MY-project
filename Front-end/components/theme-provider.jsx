"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = React.useState(false)

  // Only run on client side to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Return children with suppressed hydration warning during SSR
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
}
