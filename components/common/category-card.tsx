// Displays a service category as a card.
// Two modes:
//  - Standard (default): large grid tile with icon + name + provider count
//  - Compact: horizontal list item, used in sidebar / compact layouts

import Link from "next/link";
import {
  AirVent, Droplets, Zap, Sparkles, PaintBucket,
  Hammer, Bug, WashingMachine,
} from "lucide-react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

// Maps category icon string keys (stored in DB) to Lucide components
const iconMap: Record<string, React.ElementType> = {
  AirVent, Droplets, Zap, Sparkles, PaintBucket, Hammer, Bug, WashingMachine,
};

// Per-icon colour palette for the icon container background and hover state
const styles: Record<string, { bg: string; icon: string; hover: string }> = {
  AirVent:       { bg: "bg-sky-50",     icon: "text-sky-500",     hover: "group-hover:bg-sky-100" },
  Droplets:      { bg: "bg-blue-50",    icon: "text-blue-500",    hover: "group-hover:bg-blue-100" },
  Zap:           { bg: "bg-amber-50",   icon: "text-amber-500",   hover: "group-hover:bg-amber-100" },
  WashingMachine:{ bg: "bg-violet-50",  icon: "text-violet-500",  hover: "group-hover:bg-violet-100" },
  Sparkles:      { bg: "bg-pink-50",    icon: "text-pink-500",    hover: "group-hover:bg-pink-100" },
  PaintBucket:   { bg: "bg-orange-50",  icon: "text-orange-500",  hover: "group-hover:bg-orange-100" },
  Hammer:        { bg: "bg-yellow-50",  icon: "text-yellow-600",  hover: "group-hover:bg-yellow-100" },
  Bug:           { bg: "bg-emerald-50", icon: "text-emerald-500", hover: "group-hover:bg-emerald-100" },
};

interface CategoryCardProps {
  category: Category;
  // When true renders a compact horizontal layout instead of the default grid card
  compact?: boolean;
}

export function CategoryCard({ category, compact = false }: CategoryCardProps) {
  // Fall back to Sparkles icon and neutral colours for unknown icon keys
  const Icon = iconMap[category.icon] ?? Sparkles;
  const style = styles[category.icon] ?? { bg: "bg-muted", icon: "text-muted-foreground", hover: "group-hover:bg-muted" };

  // Compact mode: horizontal row used in sidebar lists
  if (compact) {
    return (
      <Link href={`/services?category=${category.id}`}>
        <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card text-card-foreground px-4 py-3 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors", style.bg, style.hover)}>
            <Icon size={18} className={style.icon} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{category.name}</p>
            <p className="text-xs text-muted-foreground">{category.providerCount} pros</p>
          </div>
        </div>
      </Link>
    );
  }

  // Standard mode: centred grid tile used on the homepage categories section
  return (
    <Link href={`/services?category=${category.id}`}>
      <div className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card text-card-foreground p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer text-center">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl transition-colors", style.bg, style.hover)}>
          <Icon size={26} className={style.icon} />
        </div>
        <div>
          <p className="text-sm font-semibold group-hover:text-primary transition-colors leading-tight">{category.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{category.providerCount} providers</p>
        </div>
      </div>
    </Link>
  );
}
