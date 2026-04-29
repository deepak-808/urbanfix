/**
 * Client-side API — used in Client Components (browser).
 * Reads the JWT from Zustand persisted state (localStorage) automatically.
 */
import type {
  ApiCategory, ApiProvider, ApiReview, ApiUser,
  ApiBooking, Paginated,
} from "@/types/api";

// All requests are proxied through Next.js API routes (relative /api prefix)
const BASE = "/api";

// Reads the JWT stored by Zustand's persist middleware in localStorage.
// Returns null when running server-side or when not authenticated.
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("urbanfix-auth");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

// Generic fetch wrapper: attaches the auth header and throws on non-2xx responses.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  // Attach bearer token if the user is logged in
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    // Backend may return a message string or array of validation errors
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(Array.isArray(err.message) ? err.message.join(", ") : err.message);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  // Register a new user (user or provider role)
  register: (body: {
    name: string; email: string; phone: string;
    password: string; role?: "user" | "provider";
  }) =>
    request<{ user: ApiUser; token: string }>("/auth/register", {
      method: "POST", body: JSON.stringify(body),
    }),

  // Login and receive a JWT token
  login: (body: { email: string; password: string }) =>
    request<{ user: ApiUser; token: string }>("/auth/login", {
      method: "POST", body: JSON.stringify(body),
    }),

  // Fetch the currently authenticated user's profile
  me: () => request<ApiUser>("/auth/me"),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  // Fetch all available service categories
  list: () => request<ApiCategory[]>("/categories"),

  // Admin: create a new category
  create: (body: { name: string; icon: string; description?: string }) =>
    request<ApiCategory>("/categories", { method: "POST", body: JSON.stringify(body) }),

  // Admin: update a category's details
  update: (id: string, body: Partial<{ name: string; icon: string; description: string }>) =>
    request<ApiCategory>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Admin: remove a category
  remove: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),
};

// ── Providers ─────────────────────────────────────────────────────────────────
// Query parameters supported by the providers list endpoint
type ProviderListParams = {
  categoryId?: string;
  location?: string;
  verified?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export const providersApi = {
  // List providers with optional filtering and pagination
  list: (params?: ProviderListParams) => {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][];
    const qs = entries.length ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : "";
    return request<Paginated<ApiProvider>>(`/providers${qs}`);
  },

  // Fetch a single provider by ID
  get: (id: string) => request<ApiProvider>(`/providers/${id}`),

  // Fetch the provider profile belonging to the current user (null if none)
  me: () => request<ApiProvider | null>("/providers/me"),

  // Create a new provider profile for the current user
  create: (body: object) =>
    request<ApiProvider>("/providers", { method: "POST", body: JSON.stringify(body) }),

  // Update an existing provider profile (partial update)
  update: (id: string, body: object) =>
    request<ApiProvider>(`/providers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Admin: mark a provider as verified
  verify: (id: string) =>
    request<ApiProvider>(`/providers/${id}/verify`, { method: "PATCH" }),

  // Admin: remove verification from a provider
  unverify: (id: string) =>
    request<ApiProvider>(`/providers/${id}/unverify`, { method: "PATCH" }),

  // Admin: delete a provider profile
  remove: (id: string) =>
    request<{ message: string }>(`/providers/${id}`, { method: "DELETE" }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  // List reviews for a specific provider, paginated
  list: (providerId: string, page = 1, limit = 20) =>
    request<Paginated<ApiReview>>(
      `/reviews?providerId=${providerId}&page=${page}&limit=${limit}`
    ),

  // Submit a new review for a provider
  create: (body: { providerId: string; rating: number; comment: string }) =>
    request<ApiReview>("/reviews", { method: "POST", body: JSON.stringify(body) }),

  // Admin: delete a review
  remove: (id: string) =>
    request<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
type BookingListParams = { status?: string; page?: number; limit?: number };

export const bookingsApi = {
  // List bookings for the current user, with optional status filter
  list: (params?: BookingListParams) => {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][];
    const qs = entries.length ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : "";
    return request<Paginated<ApiBooking>>(`/bookings${qs}`);
  },

  // Fetch a single booking by ID
  get: (id: string) => request<ApiBooking>(`/bookings/${id}`),

  // Create a new booking
  create: (body: {
    providerId: string; serviceName: string; servicePrice: number;
    scheduledAt: string; address?: string; notes?: string;
  }) => request<ApiBooking>("/bookings", { method: "POST", body: JSON.stringify(body) }),

  // Update a booking's status (e.g. confirm, start, complete)
  updateStatus: (id: string, status: string) =>
    request<ApiBooking>(`/bookings/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }),

  // Cancel a booking
  cancel: (id: string) =>
    request<ApiBooking>(`/bookings/${id}/cancel`, { method: "PATCH" }),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────
export const usersApi = {
  // Admin: list all users
  list: () => request<ApiUser[]>("/users"),
  // Admin: fetch a single user by ID
  get: (id: string) => request<ApiUser>(`/users/${id}`),
  // Admin: update user fields
  update: (id: string, body: object) =>
    request<ApiUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  // Admin: delete a user account
  remove: (id: string) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};
