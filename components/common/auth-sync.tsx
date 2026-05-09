"use client";

// Syncs the JWT token from Zustand (localStorage) to a cookie so that
// Next.js middleware can read it on the Edge for server-side redirects.
// Mount this once in the root layout — it renders nothing to the DOM.

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthSync() {
  const token = useAuthStore((s) => s.token);
  // Wait for Zustand to finish rehydrating from localStorage before syncing
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Do nothing until localStorage has been read
    if (!_hasHydrated) return;
    if (token) {
      // Write a 7-day cookie accessible across all paths
      document.cookie = `urbanfix-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      // Clear the cookie when the user is logged out
      document.cookie = "urbanfix-token=; path=/; max-age=0; SameSite=Lax";
    }
  }, [token, _hasHydrated]);

  // Purely side-effectful — renders nothing
  return null;
}
