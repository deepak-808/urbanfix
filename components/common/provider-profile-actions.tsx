"use client";

// Action buttons shown in the sticky sidebar of a provider's profile page.
// Renders different actions depending on whether the viewer owns the profile:
//  - Own profile: Dashboard and Manage Services links
//  - Other users: Call Now and Send Email action links

import Link from "next/link";
import { Phone, Mail, LayoutDashboard, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface Props {
  // The userId that owns this provider profile (used for ownership check)
  providerUserId: string;
  providerPhone: string;
  providerEmail: string;
}

export function ProviderProfileActions({ providerUserId, providerPhone, providerEmail }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  // True when the logged-in provider is viewing their own profile
  const isOwnProfile = isAuthenticated && user?.role === "provider" && user.id === providerUserId;

  // Provider viewing their own profile: show management actions
  if (isOwnProfile) {
    return (
      <div className="space-y-2">
        <Link href="/provider/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-3 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
          <LayoutDashboard size={15} />
          Go to Dashboard
        </Link>
        <Link href="/provider/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors">
          <Settings size={15} />
          Manage Services
        </Link>
      </div>
    );
  }

  // Other users: show call and email contact actions
  return (
    <>
      <a href={`tel:${providerPhone}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 transition-colors mb-2 shadow-sm">
        <Phone size={15} />
        Call Now
      </a>
      <a href={`mailto:${providerEmail}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-muted transition-colors">
        <Mail size={15} />
        Send Email
      </a>
    </>
  );
}
