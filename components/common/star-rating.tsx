// Renders a 1–5 star rating display.
// Supports partial (decimal) stars — e.g. a rating of 4.5 fills the 5th star halfway.

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  // Maximum number of stars (defaults to 5)
  max?: number;
  // Size of each star icon in pixels
  size?: number;
  className?: string;
}

export function StarRating({ rating, max = 5, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        // A star is fully filled when i < Math.floor(rating)
        const filled = i < Math.floor(rating);
        // A star is partially filled for the fractional portion of rating
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
            {/* Base (empty) star — shown at reduced opacity */}
            <Star
              size={size}
              className="text-muted-foreground/30"
              fill="currentColor"
            />
            {/* Filled or partial overlay — clipped to the correct width */}
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
              >
                <Star size={size} className="text-amber-400" fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
