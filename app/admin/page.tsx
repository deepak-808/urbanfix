"use client";

// Admin panel — Client Component.
// Only accessible to users with the "admin" role.
// Provides three management tabs: Providers, Users, and Categories.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, Tag, ShieldCheck, ShieldX,
  BadgeCheck, Clock, Search, MoreHorizontal, TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { providersApi, usersApi, categoriesApi } from "@/lib/api";
import { mapProvider, mapUser, mapCategory } from "@/lib/mappers";
import { StarRating } from "@/components/common/star-rating";
import { cn } from "@/lib/utils";
import type { Provider, User, Category } from "@/types";

// The three management sections available in the admin panel
type Tab = "providers" | "users" | "categories";

// Colour scheme for each user role badge
const ROLE_STYLES: Record<string, string> = {
  admin: "bg-rose-50 text-rose-700 border-rose-200",
  provider: "bg-violet-50 text-violet-700 border-violet-200",
  user: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [tab, setTab] = useState<Tab>("providers");
  // Single search input used for both providers and users tables
  const [search, setSearch] = useState("");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data in parallel once the admin is confirmed authenticated
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;
    Promise.all([
      providersApi.list({ limit: 100 }),
      usersApi.list(),
      categoriesApi.list(),
    ]).then(([pRes, uRes, cRes]) => {
      setProviders(pRes.data.map(mapProvider));
      setUsers(uRes.map(mapUser));
      setCategories(cRes.map(mapCategory));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  // Toggle verified status for a provider and update local state optimistically
  const handleVerify = async (id: string, verified: boolean) => {
    try {
      if (verified) {
        await providersApi.unverify(id);
      } else {
        await providersApi.verify(id);
      }
      // Flip the verified flag in local state without refetching
      setProviders((prev) =>
        prev.map((p) => p.id === id ? { ...p, verified: !verified } : p)
      );
    } catch { /* ignore */ }
  };

  // Wait for Zustand hydration before rendering anything auth-dependent
  if (!_hasHydrated) return null;

  // Show access-denied screen for non-admin users
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
            <ShieldX size={36} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground text-sm mb-1">
            This panel requires admin credentials.
          </p>
          <p className="text-sm mb-6">
            Use{" "}
            <button onClick={() => router.push("/login")}
              className="font-mono bg-muted rounded px-1.5 py-0.5 text-primary hover:underline text-xs">
              admin@demo.com
            </button>{" "}
            to sign in.
          </p>
          <button onClick={() => router.push("/login")}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  // Filter providers by business name, category, location or email
  const filteredProviders = providers.filter((p) =>
    [p.businessName, p.categoryName, p.location, p.email].some(
      (v) => v.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Summary stat cards shown at the top of the panel
  const stats = [
    { label: "Total Users", value: loading ? "…" : users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", change: "" },
    { label: "Providers", value: loading ? "…" : providers.length, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50", change: "" },
    { label: "Categories", value: loading ? "…" : categories.length, icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50", change: "" },
    // Pending count shows how many providers still need manual verification
    { label: "Pending Verify", value: loading ? "…" : providers.filter((p) => !p.verified).length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", change: "" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b bg-card text-card-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card text-card-foreground p-5 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                  <s.icon size={15} className={s.color} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-extrabold">{s.value}</p>
                {s.change && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp size={11} />{s.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1 rounded-xl border border-border/60 bg-card text-card-foreground p-1 shadow-xs">
            {([
              { id: "providers", label: "Providers", icon: Briefcase },
              { id: "users", label: "Users", icon: Users },
              { id: "categories", label: "Categories", icon: Tag },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                  tab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>

          {/* Search input — hidden on the Categories tab */}
          {tab !== "categories" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background text-foreground px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all w-full sm:w-64">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab}...`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          )}
        </div>

        {/* ── Providers table ──────────────────────────────────────── */}
        {tab === "providers" && (
          <div className="rounded-2xl border border-border/60 bg-card text-card-foreground overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Business", "Category", "Location", "Rating", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm">{p.businessName}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/8 text-primary px-2.5 py-0.5 text-xs font-semibold">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{p.location}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={p.rating} size={12} />
                          <span className="text-xs font-bold">{p.rating}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">
                            <BadgeCheck size={11} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 text-xs font-semibold">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Verify / Unverify action button */}
                          <button
                            onClick={() => handleVerify(p.id, p.verified)}
                            className="text-xs font-semibold text-primary hover:underline transition-colors">
                            {p.verified ? "Unverify" : "Verify"}
                          </button>
                          <button className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-colors">
                            <MoreHorizontal size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProviders.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {loading ? "Loading..." : "No providers found."}
              </div>
            )}
          </div>
        )}

        {/* ── Users table ──────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="rounded-2xl border border-border/60 bg-card text-card-foreground overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["User", "Phone", "Role", "Joined", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.filter((u) =>
                    // Filter by name or email
                    [u.name, u.email].some((v) => v.toLowerCase().includes(search.toLowerCase()))
                  ).map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar initial */}
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{u.phone}</td>
                      <td className="px-5 py-4">
                        {/* Role badge with colour coding */}
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", ROLE_STYLES[u.role])}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-colors">
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {loading ? "Loading..." : "No users found."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Categories ───────────────────────────────────────────── */}
        {tab === "categories" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                <Tag size={14} /> Add Category
              </button>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card text-card-foreground overflow-hidden shadow-xs">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Name", "Icon", "Description", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-semibold">{cat.name}</td>
                      <td className="px-5 py-4">
                        {/* Display the icon key string used in CategoryCard */}
                        <span className="font-mono text-xs rounded-lg bg-muted px-2 py-1">{cat.icon}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground max-w-xs truncate text-xs">{cat.description}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                            Edit <ChevronRight size={11} />
                          </button>
                          <button className="text-xs font-semibold text-destructive hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {loading ? "Loading..." : "No categories found."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
