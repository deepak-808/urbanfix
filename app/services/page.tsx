"use client";

// Services discovery page — Client Component wrapped in Suspense.
// Allows users to search, filter, and browse provider listings.
// Wrapped in Suspense because it reads URL search params via useSearchParams().

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, BadgeCheck, ChevronDown } from "lucide-react";
import { categoriesApi, providersApi } from "@/lib/api";
import { mapCategory, mapProvider } from "@/lib/mappers";
import { ProviderCard } from "@/components/common/provider-card";
import { cn } from "@/lib/utils";
import type { Category, Provider } from "@/types";

// Animated skeleton card shown while providers are loading
function ProviderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 animate-pulse">
      <div className="h-40 rounded-xl bg-muted mb-4" />
      <div className="h-4 w-2/3 rounded bg-muted mb-2" />
      <div className="h-3 w-1/2 rounded bg-muted mb-4" />
      <div className="h-8 rounded-lg bg-muted" />
    </div>
  );
}

// Main content component — separated so Suspense can wrap the useSearchParams() call
function ServicesContent() {
  const searchParams = useSearchParams();
  // Pre-populate filters from URL params (e.g. links from the homepage)
  const initialCategory = searchParams.get("category") ?? "";
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  // Controls visibility of the expanded filter panel
  const [showFilters, setShowFilters] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Load categories once on mount for the filter chips
  useEffect(() => {
    categoriesApi.list().then((data) => setCategories(data.map(mapCategory))).catch(() => {});
  }, []);

  // Fetches providers from the API with the current filter state
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await providersApi.list({
        categoryId: selectedCategory || undefined,
        verified: verifiedOnly || undefined,
        minRating: minRating || undefined,
        search: query || undefined,
        limit: 50,
      });
      setProviders(res.data.map(mapProvider));
      setTotal(res.total);
    } catch {
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, verifiedOnly, minRating]);

  // Debounce the fetch when the user is typing; fire immediately for other filter changes
  useEffect(() => {
    const t = setTimeout(fetchProviders, query ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProviders, query]);

  // Resolved category object for the page heading
  const activeCategory = categories.find((c) => c.id === selectedCategory);
  // Count active filters for the badge on the Filters button
  const activeFiltersCount = (verifiedOnly ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Search header ────────────────────────────────────────────── */}
      <div className="border-b bg-card text-card-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold mb-4">
            {/* Show active category name or "All Services" */}
            {activeCategory ? activeCategory.name : "All Services"}
            {!loading && total > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({total} results)
              </span>
            )}
          </h1>

          {/* Search row: text input + filters toggle button */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-background text-foreground px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, service, location..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {/* Clear search button */}
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters toggle — highlighted when filters are active */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all",
                showFilters || activeFiltersCount > 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground hover:bg-muted border-border"
              )}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {/* Active filter count badge */}
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown size={13} className={cn("transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-5 rounded-xl border bg-muted/30 px-4 py-3.5">
              {/* Verified providers filter */}
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <BadgeCheck size={14} className="text-emerald-500" />
                <span className="font-medium">Verified only</span>
              </label>

              {/* Minimum rating filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Min rating:</span>
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-semibold border transition-all",
                        minRating === r
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear all active filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setVerifiedOnly(false); setMinRating(0); }}
                  className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Category filter chips — toggling a selected chip deselects it */}
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b">
          <button
            onClick={() => setSelectedCategory("")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
              selectedCategory === ""
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-card-foreground border-border hover:border-primary/40 hover:text-primary"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-card-foreground border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results grid — skeleton during load, cards when ready, empty state otherwise */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <ProviderCardSkeleton key={i} />)}
          </div>
        ) : providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          // Empty state with a reset-all button
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground text-3xl">
              🔍
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try a different search or clear your filters.</p>
            <button
              onClick={() => { setQuery(""); setSelectedCategory(""); setVerifiedOnly(false); setMinRating(0); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <X size={14} /> Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Page export — wraps ServicesContent in Suspense to handle the
// useSearchParams() call safely during server-side rendering
export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading services...</p>
        </div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
