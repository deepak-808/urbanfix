"use client";

// Provider setup wizard — Client Component.
// Two-step onboarding flow for new providers:
//  Step 1: Business info (name, category, location, bio, contact, experience)
//  Step 2: Services (name, price, unit, duration, description)
// Redirects to the dashboard if the provider already has a profile.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, MapPin, Phone, Mail, Clock, Plus, Trash2, AlertCircle, Wrench } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { categoriesApi, providersApi } from "@/lib/api";
import { mapCategory } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

// Shape for each service the provider adds in step 2
interface ServiceInput {
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
}

// Default blank service used when adding a new service row
const EMPTY_SERVICE: ServiceInput = { name: "", description: "", price: "", unit: "per visit", duration: "" };

export default function ProviderSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  // Wizard step tracker — 1 for Business Info, 2 for Services
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Step 1 fields ──────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  // Pre-fill contact info from the user's account
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");

  // ── Step 2 fields ──────────────────────────────────────────────────────
  // Start with one blank service row
  const [services, setServices] = useState<ServiceInput[]>([{ ...EMPTY_SERVICE }]);

  // Load categories for the category select dropdown
  useEffect(() => {
    categoriesApi.list().then((data) => setCategories(data.map(mapCategory))).catch(() => {});
  }, []);

  // If the user already has a provider profile, skip setup and go to the dashboard
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    providersApi.me().then((p) => {
      if (p) router.replace("/provider/dashboard");
    }).catch(() => {});
  }, [isAuthenticated, user, router]);

  // Wait for localStorage rehydration before checking auth
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
          <p className="text-muted-foreground text-sm mb-6">Please sign in to set up your provider profile.</p>
          <button onClick={() => router.push("/login")}
            className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Service list helpers ───────────────────────────────────────────────

  // Append a blank service row to the list
  const addService = () => setServices((prev) => [...prev, { ...EMPTY_SERVICE }]);

  // Remove the service at index i (only possible when there is more than one)
  const removeService = (i: number) =>
    setServices((prev) => prev.filter((_, idx) => idx !== i));

  // Update a single field on a service row
  const updateService = (i: number, field: keyof ServiceInput, value: string) =>
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  // ── Step handlers ─────────────────────────────────────────────────────

  // Validate step 1 and advance to step 2
  const handleStep1 = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!categoryId) { setError("Please select a category."); return; }
    setStep(2);
  };

  // Submit the full profile (step 2) to the API
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");

    // Only submit services that have both a name and a price
    const validServices = services.filter((s) => s.name && s.price);
    if (validServices.length === 0) { setError("Add at least one service with a name and price."); return; }

    setLoading(true);
    try {
      await providersApi.create({
        businessName,
        categoryId,
        location,
        // Only include optional fields if they have a value
        ...(bio && { bio }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(experience && { experience }),
        ...(availability && { availability }),
        services: validServices.map((s) => ({
          name: s.name,
          description: s.description,
          price: Number(s.price),
          unit: s.unit,
          duration: s.duration,
        })),
      });
      router.push("/provider/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create provider profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 py-10 px-4">
      <div className="mx-auto max-w-2xl">

        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm mb-4">
            <Wrench size={22} />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Set up your provider profile</h1>
          <p className="text-muted-foreground text-sm">Complete your profile to start receiving bookings.</p>
        </div>

        {/* Step indicator — filled circles for completed/current steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {([1, 2] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {s}
              </div>
              <span className={cn("text-sm font-medium hidden sm:inline", step >= s ? "text-foreground" : "text-muted-foreground")}>
                {s === 1 ? "Business Info" : "Services"}
              </span>
              {/* Connector line between steps */}
              {s < 2 && <div className="w-10 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Global error alert shown above both steps */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 text-sm mb-6">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Step 1: Business Info ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6 space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Business Name <span className="text-destructive">*</span></label>
              <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ahmed's AC Services"
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Category <span className="text-destructive">*</span></label>
              <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all">
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5"><MapPin size={13} className="text-primary" />Location <span className="text-destructive">*</span></label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dubai, UAE"
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                placeholder="Describe your expertise and what makes you stand out..."
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all resize-none placeholder:text-muted-foreground" />
            </div>

            {/* Optional contact and schedule fields in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5"><Phone size={13} className="text-primary" />Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5"><Mail size={13} className="text-primary" />Business Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@example.com"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5"><Briefcase size={13} className="text-primary" />Experience</label>
                <input value={experience} onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5 years"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5"><Clock size={13} className="text-primary" />Availability</label>
                <input value={availability} onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Mon-Sat, 8am-6pm"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
              Continue to Services <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* ── Step 2: Services ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold">Your Services</h2>
                  <p className="text-sm text-muted-foreground">List what you offer and your pricing.</p>
                </div>
                <button type="button" onClick={addService}
                  className="flex items-center gap-1.5 rounded-xl border border-primary text-primary px-3 py-2 text-sm font-semibold hover:bg-primary/5 transition-colors">
                  <Plus size={14} /> Add Service
                </button>
              </div>

              <div className="space-y-5">
                {services.map((svc, i) => (
                  <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3 relative">
                    {/* Remove button — only shown when there are multiple services */}
                    {services.length > 1 && (
                      <button type="button" onClick={() => removeService(i)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Service {i + 1}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Service Name <span className="text-destructive">*</span></label>
                        <input required value={svc.name} onChange={(e) => updateService(i, "name", e.target.value)}
                          placeholder="e.g. AC Repair"
                          className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Price ($) <span className="text-destructive">*</span></label>
                        <input required type="number" min="0" value={svc.price} onChange={(e) => updateService(i, "price", e.target.value)}
                          placeholder="e.g. 80"
                          className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Unit</label>
                        <select value={svc.unit} onChange={(e) => updateService(i, "unit", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all">
                          <option>per visit</option>
                          <option>per hour</option>
                          <option>per day</option>
                          <option>flat rate</option>
                          <option>starting from</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Duration</label>
                        <input value={svc.duration} onChange={(e) => updateService(i, "duration", e.target.value)}
                          placeholder="e.g. 1-2 hours"
                          className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Description</label>
                      <input value={svc.description} onChange={(e) => updateService(i, "description", e.target.value)}
                        placeholder="Brief description of what's included"
                        className="w-full rounded-xl border border-border bg-background text-foreground px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {/* Back button returns to step 1 without losing entered data */}
              <button type="button" onClick={() => setStep(1)}
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm">
                {loading ? (
                  <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating profile...</>
                ) : (
                  <>Create Provider Profile <ArrowRight size={15} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
