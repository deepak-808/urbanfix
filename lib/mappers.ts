// Data transformation utilities: converts raw API shapes into frontend types.
// Handles the Mongoose _id / id duality and resolves populated sub-documents.

import type { ApiCategory, ApiProvider, ApiReview, ApiUser } from "@/types/api";
import type { Category, Provider, Review, User } from "@/types";

// Mongoose returns both `_id` and `id` (virtual). Prefer `id` when present.
function resolveId(obj: { _id: string; id?: string }): string {
  return obj.id ?? obj._id;
}

// Maps a raw API user to the frontend User shape
export function mapUser(u: ApiUser): User {
  return {
    id: resolveId(u),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role as User["role"],
    avatar: u.avatar,
    createdAt: u.createdAt,
  };
}

// Maps a raw API category to the frontend Category shape.
// providerCount is not returned by the backend — it defaults to 0 and is
// computed separately where needed (e.g. category listing pages).
export function mapCategory(c: ApiCategory): Category {
  return {
    id: resolveId(c),
    name: c.name,
    icon: c.icon,
    description: c.description ?? "",
    providerCount: 0, // not included in API response; computed separately
  };
}

// Maps a raw API provider to the frontend Provider shape.
// categoryId may be a populated object (when fetched with .populate()) or
// just an ID string — both cases are handled.
export function mapProvider(p: ApiProvider): Provider {
  const cat = typeof p.categoryId === "object" && p.categoryId !== null ? p.categoryId : null;
  return {
    id: resolveId(p),
    // userId can also be a populated sub-document; extract the ID either way
    userId: typeof p.userId === "object" ? resolveId(p.userId as { _id: string; id?: string }) : p.userId,
    businessName: p.businessName,
    categoryId: cat ? resolveId(cat as { _id: string; id?: string }) : String(p.categoryId),
    // Resolved display name from the populated category object (empty string if not populated)
    categoryName: cat?.name ?? "",
    location: p.location,
    bio: p.bio ?? "",
    // Services are embedded in the provider document; map _id to id for consistency
    services: p.services.map((s, i) => ({
      id: s._id ?? `s-${i}`,
      name: s.name,
      description: s.description ?? "",
      price: s.price,
      unit: s.unit ?? "per visit",
      duration: s.duration ?? "",
    })),
    rating: p.rating,
    reviewCount: p.reviewCount,
    verified: p.verified,
    images: p.images,
    phone: p.phone ?? "",
    email: p.email ?? "",
    experience: p.experience ?? "",
    availability: p.availability ?? "",
    createdAt: p.createdAt,
  };
}

// Maps a raw API review to the frontend Review shape.
// userId may be a populated user sub-document; falls back to "Anonymous"
// if the user reference is not populated.
export function mapReview(r: ApiReview): Review {
  const u = typeof r.userId === "object" && r.userId !== null ? r.userId : null;
  return {
    id: resolveId(r),
    userId: u ? resolveId(u as { _id: string; id?: string }) : String(r.userId),
    userName: u?.name ?? "Anonymous",
    userAvatar: u?.avatar,
    providerId: r.providerId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}
