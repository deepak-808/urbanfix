// Frontend domain types used across the application.
// These are mapped from raw API responses via lib/mappers.ts.

// User roles supported by the platform
export type Role = "user" | "provider" | "admin";

// Represents an authenticated or listed user
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

// A service category (e.g. AC Repair, Plumbing)
export interface Category {
  id: string;
  name: string;
  // Icon key — mapped to a Lucide component in CategoryCard
  icon: string;
  description: string;
  // Number of providers in this category (computed client-side)
  providerCount: number;
}

// An individual service offered by a provider
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  // Pricing unit, e.g. "per visit", "per hour"
  unit: string;
  // Estimated job duration, e.g. "1-2 hours"
  duration: string;
}

// Full provider profile with all nested data
export interface Provider {
  id: string;
  // ID of the user account that owns this provider profile
  userId: string;
  businessName: string;
  categoryId: string;
  // Resolved category name (from populated categoryId)
  categoryName: string;
  location: string;
  services: Service[];
  // Calculated average rating (0–5)
  rating: number;
  reviewCount: number;
  // Whether an admin has verified this provider
  verified: boolean;
  bio: string;
  // Array of work-sample image URLs
  images: string[];
  phone: string;
  email: string;
  // e.g. "5 years"
  experience: string;
  // e.g. "Mon–Sat, 8am–6pm"
  availability: string;
  createdAt: string;
}

// A customer review for a provider
export interface Review {
  id: string;
  userId: string;
  // Resolved display name (from populated userId)
  userName: string;
  userAvatar?: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Filter options used in the services discovery page
export interface SearchFilters {
  category?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
}
