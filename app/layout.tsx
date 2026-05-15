// Root layout — wraps every page in the application.
// Applies global fonts, theme provider, auth sync, and persistent navbar.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/common/navbar"
import { AuthSync } from "@/components/common/auth-sync"
import { cn } from "@/lib/utils";

// Geist sans-serif used as the primary body font
const geist = Geist({subsets:['latin'],variable:'--font-sans'})

// Geist Mono used for code snippets and monospace elements
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "UrbanFix — Home Services Done Right",
  description: "Find verified professionals for AC repair, plumbing, electrical work, cleaning, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        {/* ThemeProvider enables dark/light/system mode */}
        <ThemeProvider>
          {/* AuthSync mirrors Zustand token to cookie for Edge middleware */}
          <AuthSync />
          {/* Persistent sticky navbar across all pages */}
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
