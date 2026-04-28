import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Uses clsx to handle conditional/array inputs, then tailwind-merge to
 * deduplicate conflicting utility classes (e.g. p-2 vs p-4).
 * Used throughout the UI for dynamic className composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
