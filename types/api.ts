// Raw shapes returned by the NestJS/MongoDB backend.
// All documents have `_id` (string after JSON serialisation) and Mongoose also
// attaches `id` as a virtual mirror of `_id`.

// Supported user roles on the platform
export type ApiRole = "user" | "provider" | "admin";

// Booking lifecycle states
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

// Raw user document from the API
export interface ApiUser {
  _id: string;
  // Mongoose virtual, same value as _id
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ApiRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Raw category document from the API
export interface ApiCategory {
  _id: string;
  id: string;
  name: string;
  // Lucide icon name string, e.g. "AirVent"
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Embedded service item within a provider document
export interface ApiServiceItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  // Pricing unit, e.g. "per visit"
  unit?: string;
  // Duration estimate, e.g. "1-2 hours"
  duration?: string;
}

// Raw provider document — categoryId and userId may be populated objects
// when fetched with Mongoose's .populate()
export interface ApiProvider {
  _id: string;
  id: string;
  // May be just an ID string, or a populated user sub-document
  userId: string | Pick<ApiUser, "_id" | "id" | "name" | "email" | "avatar">;
  businessName: string;
  // May be just an ID string, or a populated category sub-document
  categoryId: string | Pick<ApiCategory, "_id" | "id" | "name" | "icon">;
  location: string;
  bio?: string;
  services: ApiServiceItem[];
  // Aggregated average rating maintained by the backend
  rating: number;
  reviewCount: number;
  // Toggled by admin via PATCH /providers/:id/verify
  verified: boolean;
  images: string[];
  phone?: string;
  email?: string;
  experience?: string;
  availability?: string;
  createdAt: string;
  updatedAt: string;
}

// Raw review document — userId may be a populated user sub-document
export interface ApiReview {
  _id: string;
  id: string;
  userId: string | Pick<ApiUser, "_id" | "id" | "name" | "avatar">;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Raw booking document
export interface ApiBooking {
  _id: string;
  id: string;
  userId: string | Pick<ApiUser, "_id" | "id" | "name" | "email" | "phone">;
  providerId: string | Pick<ApiProvider, "_id" | "id" | "businessName" | "location">;
  serviceName: string;
  servicePrice: number;
  scheduledAt: string;
  address?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

// Generic paginated response wrapper used by list endpoints
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
