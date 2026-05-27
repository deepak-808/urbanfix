// Provider profile page — Server Component.
// Fetches the provider and their reviews server-side on every request.
// Shows the full profile: cover image, bio, services, gallery, and reviews.
// A sticky sidebar provides quick contact actions and stat summary.

import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  BadgeCheck,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Briefcase,
  Star,
  CheckCircle2,
} from "lucide-react"
import { serverApi } from "@/lib/server-api"
import { mapProvider, mapReview } from "@/lib/mappers"
import { StarRating } from "@/components/common/star-rating"
import { ContactButton } from "@/components/common/contact-button"
import { ProviderProfileActions } from "@/components/common/provider-profile-actions"
import { ManageServicesButton } from "@/components/common/manage-services-button"
import Image from "next/image"

// Disable caching so the profile always reflects the latest data
export const dynamic = "force-dynamic"

interface Props {
  // Next.js 15 passes route params as a Promise in Server Components
  params: Promise<{ id: string }>
}

export default async function ProviderPage({ params }: Props) {
  const { id } = await params
  // Fetch provider and reviews in parallel to minimise waterfall latency
  const [providerRaw, reviewsRaw] = await Promise.all([
    serverApi.provider(id),
    serverApi.reviews(id),
  ])

  // Return a 404 page if the provider doesn't exist
  if (!providerRaw) notFound()

  const provider = mapProvider(providerRaw)
  const reviews = (reviewsRaw?.data ?? []).map(mapReview)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="border-b bg-card text-card-foreground">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Two-column layout: main content + sticky sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Main column ──────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Profile card with cover image and business details */}
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground">
              {/* Cover image area */}
              <div className="relative h-52 bg-linear-to-br from-primary/20 via-primary/10 to-secondary">
                {provider.images[0] && (
                  <img
                    src={provider.images[0]}
                    alt={provider.businessName}
                    className="h-full w-full object-cover"
                  />
                )}
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

                {/* Verified badge in the top-right corner */}
                {provider.verified && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow">
                    <BadgeCheck size={13} />
                    Verified Pro
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    {/* Category pill */}
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                        {provider.categoryName}
                      </span>
                    </div>
                    <h1 className="text-2xl leading-tight font-bold">
                      {provider.businessName}
                    </h1>
                    {/* Star rating and review count */}
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating rating={provider.rating} size={15} />
                      <span className="text-sm font-bold">
                        {provider.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  {/* Contact or Edit Profile button (role-aware Client Component) */}
                  <ContactButton provider={provider} />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {provider.bio}
                </p>

                {/* Meta grid: location, availability, experience, phone, email */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { icon: MapPin,    label: "Location",     value: provider.location },
                    { icon: Clock,     label: "Availability", value: provider.availability },
                    { icon: Briefcase, label: "Experience",   value: provider.experience },
                    { icon: Phone,     label: "Phone",        value: provider.phone },
                    { icon: Mail,      label: "Email",        value: provider.email },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3"
                    >
                      <item.icon size={14} className="mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                          {item.label}
                        </p>
                        <p className="truncate text-xs font-medium">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Services & Pricing ─────────────────────────────────── */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Services & Pricing</h2>
                {/* Manage link — only visible to the provider who owns this profile */}
                <ManageServicesButton providerUserId={provider.userId} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {provider.services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl border border-border/60 bg-card p-4 text-card-foreground transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                          <h3 className="text-sm font-semibold">{service.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">⏱ {service.duration}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-extrabold text-primary">${service.price}</p>
                        <p className="text-[10px] text-muted-foreground">{service.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Gallery ────────────────────────────────────────────── */}
            {/* Only shown when the provider has uploaded more than the cover image */}
            {provider.images.length > 1 && (
              <div>
                <h2 className="mb-4 text-lg font-bold">Gallery</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {provider.images.map((img, i) => (
                    <div key={i} className="relative aspect-video w-full overflow-hidden rounded-xl">
                      <Image
                        src={img}
                        alt={`Work sample ${i + 1}`}
                        fill
                        className="cursor-pointer object-cover transition-opacity hover:opacity-90"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews ────────────────────────────────────────────── */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Reviews
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({provider.reviewCount} total)
                  </span>
                </h2>
                {/* Average rating badge */}
                <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-700">{provider.rating}</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-border/60 bg-card p-5 text-card-foreground"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        {/* Reviewer avatar initial */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {review.userName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                            </p>
                          </div>
                          <StarRating rating={review.rating} size={13} className="mt-1" />
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state for providers with no reviews yet
                <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Sticky contact card */}
            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 text-card-foreground shadow-sm">
              <h3 className="mb-1 font-bold">{provider.businessName}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{provider.categoryName}</p>

              {/* Direct phone and email links */}
              <div className="mb-5 space-y-3">
                <a
                  href={`tel:${provider.phone}`}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-all hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Phone</p>
                    <p className="text-sm font-semibold">{provider.phone}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${provider.email}`}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-all hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Email</p>
                    <p className="truncate text-sm font-semibold">{provider.email}</p>
                  </div>
                </a>
              </div>

              {/* Role-aware CTA buttons (Client Component) */}
              <ProviderProfileActions
                providerUserId={provider.userId}
                providerPhone={provider.phone}
                providerEmail={provider.email}
              />

              {/* Availability reminder */}
              <div className="mt-4 rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  <Clock size={11} className="mr-1 inline" />
                  {provider.availability}
                </p>
              </div>
            </div>

            {/* Quick stats card */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 text-card-foreground">
              <h3 className="mb-4 text-sm font-bold">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Rating",     value: `${provider.rating}`,           sub: "/ 5.0" },
                  { label: "Reviews",    value: `${provider.reviewCount}`,       sub: "verified" },
                  { label: "Experience", value: provider.experience,             sub: "" },
                  { label: "Services",   value: `${provider.services.length}`,   sub: "offered" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                    {stat.sub && (
                      <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                    )}
                    <p className="mt-0.5 text-xs font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
