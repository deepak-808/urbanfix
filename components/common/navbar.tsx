"use client"

// Sticky top navigation bar with:
//  - Logo and site nav links
//  - Authenticated user dropdown (name, dashboard/admin links, sign out)
//  - Login / Get Started CTAs for guests
//  - Responsive hamburger menu for mobile

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Wrench,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore()
  // Controls the mobile hamburger menu visibility
  const [menuOpen, setMenuOpen] = useState(false)
  // Controls the desktop user dropdown visibility
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Clears auth and redirects to homepage
  const handleLogout = () => {
    logout()
    router.push("/")
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const navLinks = [{ href: "/services", label: "Find Services" }]

  // Hide auth CTAs on the login/register pages to avoid redundancy
  const isAuthPage = pathname === "/login" || pathname === "/register"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:bg-background/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Wrench size={16} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Urban<span className="text-primary">Fix</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth area */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Authenticated: show user avatar + dropdown */}
            {_hasHydrated && isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-xs transition-colors hover:bg-muted/50"
                >
                  {/* Avatar initial */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    {/* Invisible backdrop to close dropdown on outside click */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border bg-card py-1.5 text-card-foreground shadow-lg">
                      {/* User info header */}
                      <div className="mb-1 border-b px-3 py-2">
                        <p className="text-xs font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      {/* Role-specific dashboard links */}
                      {user.role === "provider" && (
                        <Link
                          href="/provider/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                        >
                          <LayoutDashboard size={14} className="text-muted-foreground" />
                          Provider Dashboard
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                        >
                          <ShieldCheck size={14} className="text-muted-foreground" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Guest: show login and register CTAs */}
            {_hasHydrated && !isAuthenticated && !isAuthPage && (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="border-t bg-white md:hidden dark:bg-background">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t pt-2">
              {/* Authenticated mobile section */}
              {_hasHydrated && isAuthenticated && user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.role === "provider" && (
                    <Link
                      href="/provider/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
                    >
                      <ShieldCheck size={15} /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : _hasHydrated && !isAuthPage ? (
                /* Guest mobile section */
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Get Started
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
