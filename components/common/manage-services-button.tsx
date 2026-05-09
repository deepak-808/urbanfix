"use client";

// Conditionally renders a "Manage Services" link on a provider's profile page.
// Only visible to the provider who owns the profile — hidden for all other viewers.

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

interface ManageServicesButtonProps {
  // The userId that owns this provider profile
  providerUserId: string;
}

export function ManageServicesButton({ providerUserId }: ManageServicesButtonProps) {
  const { isAuthenticated, user } = useAuthStore();
  // Only show if the currently logged-in provider is viewing their own profile
  const isOwnProfile = isAuthenticated && user?.role === "provider" && user.id === providerUserId;

  // Render nothing for all other users / roles
  if (!isOwnProfile) return null;

  return (
    <Link
      href="/provider/dashboard"
      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
    >
      + Manage Services
    </Link>
  );
}
