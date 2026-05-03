"use client"

// Wraps the app with next-themes for dark/light/system theme support.
// Also registers a keyboard shortcut ("D") to toggle the theme globally.

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// Main provider component — wraps children with next-themes and the hotkey listener
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {/* ThemeHotkey is a headless component that adds the 'D' key shortcut */}
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

// Returns true when the focused element is an editable input, to prevent
// the theme toggle from firing while the user is typing.
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

// Headless component that listens for the "D" key to toggle dark/light mode.
// Skips modifier keys (Cmd/Ctrl/Alt) and input targets to avoid conflicts.
function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Ignore repeated keydown events (key held down)
      if (event.defaultPrevented || event.repeat) {
        return
      }

      // Don't intercept keyboard shortcuts
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      // Only trigger on the "D" key
      if (!event.key || event.key.toLowerCase() !== "d") {
        return
      }

      // Don't fire while the user is typing in a form field
      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    // Cleanup on unmount or when the theme changes
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
