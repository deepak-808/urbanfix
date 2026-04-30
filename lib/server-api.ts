/**
 * Server-side API client — used only in Next.js Server Components.
 * Fetches are made from the server (Node.js) to the backend, not the browser.
 * No auth token is needed here since these are public read endpoints.
 */
import type { ApiCategory, ApiProvider, ApiReview, Paginated } from "@/types/api";

// The backend base URL; falls back to localhost for local development
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Generic GET helper — returns null on any error so pages can render gracefully
// even when the backend is not available (e.g. during static builds or CI).
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      cache: "no-store", // always fresh — no stale build-time data
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend not reachable (not running locally, etc.)
    return null;
  }
}

// Query parameters supported by the server-side provider list endpoint
type ProviderParams = {
  verified?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  categoryId?: string;
  minRating?: number;
};

export const serverApi = {
  // Fetch all categories for navigation and filtering
  categories: () => get<ApiCategory[]>("/categories"),

  // Fetch a paginated list of providers with optional filters
  providers: (params?: ProviderParams) => {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][];
    const qs = entries.length
      ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
      : "";
    return get<Paginated<ApiProvider>>(`/providers${qs}`);
  },

  // Fetch a single provider by ID for the profile page
  provider: (id: string) => get<ApiProvider>(`/providers/${id}`),

  // Fetch reviews for a provider (up to 50 per page)
  reviews: (providerId: string) =>
    get<Paginated<ApiReview>>(`/reviews?providerId=${providerId}&limit=50`),
};
