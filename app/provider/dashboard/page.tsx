"use client";

// Provider dashboard — Client Component.
// Accessible only to authenticated providers.
// Three tabs:
//  - Overview: stats cards, business info, recent reviews
//  - My Services: list of services with add/remove actions
//  - Profile Settings: edit business details form

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Settings, PlusCircle, Star, MapPin, Phone, Mail,
  BadgeCheck, Briefcase, TrendingUp, MessageSquare, Clock, Pencil,
  Trash2, AlertCircle, ChevronRight, X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { providersApi, reviewsApi } from "@/lib/api";
import { mapProvider, mapReview } from "@/lib/mappers";
import { StarRating } from "@/components/common/star-rating";
import { cn } from "@/lib/utils";
import type { Provider, Review, Service } from "@/types";

// The three sections available in the dashboard
type Tab = "overview" | "services" | "profile";

// Shape of the "Add Service" modal form
interface ServiceForm {
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
}

const EMPTY_FORM: ServiceForm = { name: "", description: "", price: "", unit: "per visit", duration: "" };

// Animated skeleton shown while the dashboard data is loading
function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 animate-pulse">
      <div className="border-b bg-card h-20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="h-10 w-64 rounded-xl bg-muted" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Modal dialog for adding a new service to the provider's profile
function AddServiceModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (svc: Service) => Promise<void>;
}) {
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Helper to update a single field in the form state
  const set = (field: keyof ServiceForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price) { setError("Name and price are required."); return; }
    setSaving(true);
    try {
      await onAdd({
        // Temporary client-side ID replaced by the server on save
        id: `tmp-${Date.now()}`,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        duration: form.duration,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card text-card-foreground shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold">Add New Service</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 text-sm">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Service Name <span className="text-destructive">*</span></label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. AC Repair"
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Price ($) <span className="text-destructive">*</span></label>
              <input required type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 80"
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all">
                <option>per visit</option>
                <option>per hour</option>
                <option>per day</option>
                <option>flat rate</option>
                <option>starting from</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Duration</label>
            <input value={form.duration} onChange={(e) => set("duration", e.target.value)}
              placeholder="e.g. 1-2 hours"
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Description</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of what's included"
              className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm">
              {saving ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
              ) : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // Controls visibility of the Add Service modal
  const [showAddService, setShowAddService] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Mirror of the provider's editable fields used by the Profile Settings form
  const [profileForm, setProfileForm] = useState({
    businessName: "", bio: "", location: "", availability: "", phone: "", experience: "",
  });

  // Fetch the provider's own profile and their recent reviews on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    providersApi.me().then(async (providerRaw) => {
      if (!providerRaw) { setLoading(false); return; }
      const mapped = mapProvider(providerRaw);
      setProvider(mapped);
      // Pre-populate the profile edit form with current values
      setProfileForm({
        businessName: mapped.businessName,
        bio: mapped.bio,
        location: mapped.location,
        availability: mapped.availability,
        phone: mapped.phone,
        experience: mapped.experience,
      });
      try {
        const rev = await reviewsApi.list(mapped.id, 1, 10);
        setReviews(rev.data.map(mapReview));
      } catch { /* no reviews yet */ }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, user]);

  // Append the new service to the provider's existing list and persist via API
  const handleAddService = async (newSvc: Service) => {
    if (!provider) return;
    const updatedServices = [...provider.services, newSvc];
    // Let any error propagate so the modal can display the message
    const raw = await providersApi.update(provider.id, {
      services: updatedServices.map((s) => ({
        name: s.name,
        description: s.description,
        price: s.price,
        unit: s.unit,
        duration: s.duration,
      })),
    });
    setProvider(mapProvider(raw));
  };

  // Remove a service by ID and persist the updated list
  const handleRemoveService = async (serviceId: string) => {
    if (!provider) return;
    const updatedServices = provider.services.filter((s) => s.id !== serviceId);
    // Update UI optimistically before the API call
    setProvider({ ...provider, services: updatedServices });
    try {
      await providersApi.update(provider.id, {
        services: updatedServices.map((s) => ({
          name: s.name,
          description: s.description,
          price: s.price,
          unit: s.unit,
          duration: s.duration,
        })),
      });
    } catch { /* ignore — UI already updated */ }
  };

  // Save the profile form fields that have non-empty values
  const handleSaveProfile = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!provider) return;
    setSavingProfile(true);
    try {
      // Only send fields that have been filled in
      const payload = Object.fromEntries(
        Object.entries(profileForm).filter(([, v]) => v !== "")
      );
      const raw = await providersApi.update(provider.id, payload);
      setProvider(mapProvider(raw));
    } catch { /* ignore */ }
    setSavingProfile(false);
  };

  // Wait for hydration before rendering auth-dependent UI
  if (!_hasHydrated) return null;

  // Show sign-in prompt for unauthenticated visitors
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-muted-foreground text-sm mb-6">You need to be signed in to access the provider dashboard.</p>
          <button onClick={() => router.push("/login")}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;

  // Show setup prompt if the user doesn't have a provider profile yet
  if (!provider) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground text-3xl">
            🔧
          </div>
          <h2 className="text-xl font-bold mb-2">No provider profile found</h2>
          <p className="text-muted-foreground text-sm mb-6">You don&apos;t have a provider profile yet. Create one to start receiving bookings.</p>
          <button onClick={() => router.push("/provider/setup")}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors">
            Create Provider Profile
          </button>
        </div>
      </div>
    );
  }

  // Stat cards shown at the top of the Overview tab
  const stats = [
    { label: "Rating", value: provider.rating.toString(), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Reviews", value: provider.reviewCount.toString(), icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Services", value: provider.services.length.toString(), icon: Briefcase, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Experience", value: provider.experience, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "services" as Tab, label: "My Services", icon: Briefcase },
    { id: "profile" as Tab, label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">

      {/* Add Service modal overlay */}
      {showAddService && (
        <AddServiceModal
          onClose={() => setShowAddService(false)}
          onAdd={handleAddService}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b bg-card text-card-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold">Provider Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{user.name}</span>
              </p>
            </div>
            {/* Verification status badge */}
            {provider.verified ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 text-xs font-semibold">
                <BadgeCheck size={13} /> Verified Pro
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 text-xs font-semibold">
                <Clock size={13} /> Pending Verification
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Tab bar ─────────────────────────────────────────────── */}
        <div className="flex gap-1 rounded-xl border border-border/60 bg-card text-card-foreground p-1 w-fit mb-6 shadow-xs">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/60 bg-card text-card-foreground p-5 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                      <s.icon size={15} className={s.color} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business info card */}
              <div className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold">Business Info</h2>
                  {/* Shortcut to Profile Settings tab */}
                  <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    onClick={() => setTab("profile")}>
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Briefcase, label: provider.businessName, sub: provider.categoryName },
                    { icon: MapPin, label: provider.location, sub: "Location" },
                    { icon: Clock, label: provider.availability, sub: "Availability" },
                    { icon: Phone, label: provider.phone, sub: "Phone" },
                    { icon: Mail, label: provider.email, sub: "Email" },
                  ].map((item) => (
                    <div key={item.sub} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <item.icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent reviews card — shows latest 3 */}
              <div className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold">Recent Reviews</h2>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-700">{provider.rating}</span>
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {r.userName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold">{r.userName}</p>
                            <StarRating rating={r.rating} size={11} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">No reviews yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Services tab ─────────────────────────────────────────── */}
        {tab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Your Services</h2>
                <p className="text-sm text-muted-foreground">{provider.services.length} services listed</p>
              </div>
              <button onClick={() => setShowAddService(true)}
                className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                <PlusCircle size={15} /> Add Service
              </button>
            </div>

            {/* Empty state when no services exist */}
            {provider.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Briefcase size={20} />
                </div>
                <p className="font-semibold text-sm mb-1">No services yet</p>
                <p className="text-xs text-muted-foreground mb-4">Add your first service to start receiving bookings.</p>
                <button onClick={() => setShowAddService(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors">
                  <PlusCircle size={14} /> Add Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {provider.services.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-border/60 bg-card text-card-foreground p-5 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">{service.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {service.duration && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                              ⏱ {service.duration}
                            </span>
                          )}
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            {service.unit}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-extrabold text-primary">${service.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3 border-t">
                      <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => handleRemoveService(service.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors ml-auto">
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Settings tab ──────────────────────────────────── */}
        {tab === "profile" && (
          <div className="max-w-2xl">
            <form onSubmit={handleSaveProfile}
              className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6 space-y-5">
              <div>
                <h2 className="font-bold mb-1">Profile Settings</h2>
                <p className="text-sm text-muted-foreground">Update your business info and availability.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Business Name</label>
                <input value={profileForm.businessName}
                  onChange={(e) => setProfileForm((f) => ({ ...f, businessName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Bio</label>
                <textarea value={profileForm.bio} rows={4}
                  onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all resize-none" />
              </div>

              {/* Location, availability, phone and experience in a 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { label: "Location", key: "location" },
                  { label: "Availability", key: "availability" },
                  { label: "Phone", key: "phone" },
                  { label: "Experience", key: "experience" },
                ] as { label: string; key: keyof typeof profileForm }[]).map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-semibold">{field.label}</label>
                    <input value={profileForm[field.key]}
                      onChange={(e) => setProfileForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors shadow-sm">
                  {savingProfile ? (
                    <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                  ) : (
                    <>Save Changes <ChevronRight size={14} /></>
                  )}
                </button>
                {/* Cancel returns to the Overview tab */}
                <button type="button" onClick={() => setTab("overview")}
                  className="rounded-xl border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
