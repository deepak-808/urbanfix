"use client";

// Zustand store for authentication state.
// Persisted to localStorage under "urbanfix-auth" so the session survives
// page refreshes. Mirrors the token into a cookie so Next.js middleware
// can perform server-side redirects on the Edge.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { authApi } from "@/lib/api";
import { mapUser } from "@/lib/mappers";

// Sets or clears the "urbanfix-token" cookie used by Edge middleware.
// The cookie is valid for 7 days, same-site Lax (safe for cross-page nav).
function setTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `urbanfix-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    // Expire immediately to clear the cookie
    document.cookie = "urbanfix-token=; path=/; max-age=0; SameSite=Lax";
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // True once Zustand has rehydrated state from localStorage.
  // Components should gate any auth-dependent rendering on this flag
  // to avoid a flash of wrong UI on initial load.
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "provider";
  }) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Calls the login API, stores the returned user + token, and syncs the cookie
      login: async (email, password) => {
        try {
          const res = await authApi.login({ email, password });
          setTokenCookie(res.token);
          set({ user: mapUser(res.user), token: res.token, isAuthenticated: true });
          return { success: true, message: "Logged in successfully" };
        } catch (err: unknown) {
          return {
            success: false,
            message: err instanceof Error ? err.message : "Login failed",
          };
        }
      },

      // Clears all auth state and removes the cookie
      logout: () => {
        setTokenCookie(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Registers a new account, then logs the user in immediately
      register: async (data) => {
        try {
          const res = await authApi.register(data);
          setTokenCookie(res.token);
          set({ user: mapUser(res.user), token: res.token, isAuthenticated: true });
          return { success: true, message: "Account created successfully" };
        } catch (err: unknown) {
          return {
            success: false,
            message: err instanceof Error ? err.message : "Registration failed",
          };
        }
      },
    }),
    {
      name: "urbanfix-auth",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Signal that the store has finished loading from localStorage
          state._hasHydrated = true;
          // Re-sync cookie in case it expired but localStorage still has the token
          if (state.token) setTokenCookie(state.token);
        }
      },
    }
  )
);
