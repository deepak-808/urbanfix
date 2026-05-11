// Provider summary card — shown in grid layouts on the homepage and services page.
// Clicking the card navigates to the full provider profile page.

import Link from "next/link"
import Image from "next/image"
import { MapPin, BadgeCheck, Clock } from "lucide-react"
import { Provider } from "@/types"
import { StarRating } from "./star-rating"

interface ProviderCardProps {
  provider: Provider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  // Calculate the lowest service price to display as the "from" price
  const startingPrice =
    provider.services.length > 0
      ? Math.min(...provider.services.map((s) => s.price))
      : null

  return (
    <Link href={`/providers/${provider.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground transition-all duration-200 hover:border-primary/20 hover:shadow-lg">
        {/* Cover image — falls back to the business initial when no image is set */}
        <div className="relative h-44 overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-secondary">
          {provider.images[0] ? (
            <Image
              src={provider.images[0]}
              alt={provider.businessName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Placeholder with the first letter of the business name
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl font-black text-primary/15 select-none">
                {provider.businessName.charAt(0)}
              </span>
            </div>
          )}

          {/* Category badge in the top-left corner */}
          <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm dark:bg-zinc-900/90">
            {provider.categoryName}
          </div>

          {/* Verified badge icon in the top-right corner */}
          {provider.verified && (
            <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
              <BadgeCheck size={14} className="text-white" />
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Business name and starting price */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-sm leading-snug font-semibold transition-colors group-hover:text-primary">
              {provider.businessName}
            </h3>
            {startingPrice !== null && (
              <div className="shrink-0 text-right">
                <p className="text-xs leading-none text-muted-foreground">
                  from
                </p>
                <p className="text-base font-bold text-primary">
                  ${startingPrice}
                </p>
              </div>
            )}
          </div>

          {/* Star rating and review count */}
          <div className="mb-2 flex items-center gap-1.5">
            <StarRating rating={provider.rating} size={13} />
            <span className="text-xs font-semibold">{provider.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({provider.reviewCount} reviews)
            </span>
          </div>

          {/* Location and experience metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{provider.location}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <Clock size={11} />
              {provider.experience}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
