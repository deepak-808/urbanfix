"use client";

// Footer sections rendered at the bottom of the homepage.
// Includes two parts:
//  1. Provider CTA banner — only shown to guests (hidden when logged in)
//  2. Main footer with logo, nav links, and copyright

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function HomeFooterSections() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  // Wait for hydration before checking auth state to avoid a flash of wrong content
  const loggedIn = _hasHydrated && isAuthenticated && !!user;

  return (
    <>
      {/* ── Provider CTA ─────────────────────────────────────────────── */}
      {/* Hidden for logged-in users since they already have an account */}
      {!loggedIn && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-[oklch(0.45_0.22_262)] text-white px-8 py-14 text-center">
              {/* Decorative background blobs */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-3">For professionals</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Grow your business with UrbanFix</h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto text-base">
                  Join 500+ verified pros and reach thousands of customers in your city. Free to list.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-bold px-8 py-3.5 text-sm hover:bg-white/90 transition-colors shadow-lg"
                >
                  Register as a Provider <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t bg-card text-card-foreground py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 font-bold text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-xs font-black">U</span>
              </div>
              Urban<span className="text-primary">Fix</span>
            </div>

            {/* Nav links — role-specific when authenticated */}
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
              {loggedIn ? (
                <>
                  {/* Show dashboard link for providers */}
                  {user.role === "provider" && (
                    <Link href="/provider/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  )}
                  {/* Show admin panel link for admins */}
                  {user.role === "admin" && (
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                  )}
                </>
              ) : (
                // Guest links
                <>
                  <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
                  <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground">© 2025 UrbanFix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
