// Homepage — Server Component.
// Fetches live categories and top verified providers on every request
// (force-dynamic) and renders the full marketing landing page.

import Link from "next/link";
import { Search, ShieldCheck, Star, Clock, ChevronRight, BadgeCheck } from "lucide-react";
import { HomeFooterSections } from "@/components/common/home-footer";
import { serverApi } from "@/lib/server-api";
import { mapCategory, mapProvider } from "@/lib/mappers";
import { CategoryCard } from "@/components/common/category-card";
import { ProviderCard } from "@/components/common/provider-card";

// Disable caching so the page always reflects the latest providers/categories
export const dynamic = "force-dynamic";

// Static platform stats shown in the stats bar below the hero
const STATS = [
  { value: "10K+", label: "Happy customers" },
  { value: "500+", label: "Verified pros" },
  { value: "4.8★", label: "Average rating" },
  { value: "24/7", label: "Support" },
];

// Three-step explanation for the "How it works" section
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Search a service",
    desc: "Tell us what you need — AC repair, plumbing, cleaning, or anything else.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Pick a verified pro",
    desc: "Browse profiles, compare prices, and read real reviews from past customers.",
  },
  {
    step: "03",
    icon: Star,
    title: "Get it done & rate",
    desc: "Book an appointment, get the job done, then leave your honest review.",
  },
];

export default async function HomePage() {
  // Fetch categories and top 3 verified providers in parallel
  const [categoriesRaw, providersRaw] = await Promise.all([
    serverApi.categories(),
    serverApi.providers({ verified: true, limit: 3 }),
  ]);

  const categories = (categoriesRaw ?? []).map(mapCategory);
  const topProviders = (providersRaw?.data ?? []).map(mapProvider);
  // Show up to 8 categories in the popular categories grid
  const popularCategories = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary to-[oklch(0.45_0.22_262)] text-white">
        {/* Decorative blobs for visual depth */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="mx-auto max-w-2xl text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <BadgeCheck size={14} className="text-emerald-300" />
              <span>Verified professionals only</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-5">
              Home services,<br />
              <span className="text-white/80">done the right way.</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto">
              Book trusted professionals for any home service — AC repair, plumbing, cleaning, electrical & more.
            </p>

            {/* Search bar — submits to /services with ?q= query param */}
            <form action="/services" method="get">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
                <div className="flex flex-1 items-center gap-3 pl-3">
                  <Search size={18} className="text-muted-foreground shrink-0" />
                  <input
                    name="q"
                    type="text"
                    placeholder="What service do you need?"
                    className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-muted-foreground py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick category links below the search bar */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.id}`}
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-1.5 text-sm transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider between hero and stats bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48h1440V24C1200 48 960 0 720 24S240 48 0 24V48z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Categories ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Services</p>
              <h2 className="text-2xl sm:text-3xl font-bold">What do you need help with?</h2>
            </div>
            <Link href="/services" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All services <ChevronRight size={15} />
            </Link>
          </div>

          {/* 8-column grid of category tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {popularCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>

          {/* Mobile "Browse all" link (hidden on larger screens) */}
          <div className="mt-4 sm:hidden text-center">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Browse all <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Simple process</p>
            <h2 className="text-2xl sm:text-3xl font-bold">How UrbanFix works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon size={28} />
                  </div>
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black">
                    {item.step.slice(1)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Providers ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Top rated</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Professionals near you</h2>
            </div>
            <Link href="/services" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          {/* 3-column grid of the top verified providers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50", title: "Verified & insured", desc: "Every professional passes a background check and ID verification before joining UrbanFix." },
              { icon: Star, color: "text-amber-500 bg-amber-50", title: "Reviewed by real users", desc: "Thousands of verified reviews help you make confident, informed decisions every time." },
              { icon: Clock, color: "text-primary bg-primary/10", title: "On-time guarantee", desc: "Professionals respect your schedule. If they're late, we make it right — guaranteed." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with provider CTA (guests only) and site links */}
      <HomeFooterSections />
    </div>
  );
}
