"use client";

// Smart contact button shown on provider profile pages.
// Behaviour depends on the viewer's identity:
//  - Own profile (provider): renders an "Edit Profile" link to the dashboard
//  - Guest (not logged in): redirects to /login before initiating contact
//  - Other authenticated user: initiates a phone call via tel: link

import { Phone, Settings } from "lucide-react";
import { Provider } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ContactButtonProps {
  provider: Provider;
}

export function ContactButton({ provider }: ContactButtonProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // Check if the current user is viewing their own provider profile
  const isOwnProfile = isAuthenticated && user?.role === "provider" && user.id === provider.userId;

  const handleClick = () => {
    // Redirect unauthenticated visitors to login before contacting
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Open the phone dialler for authenticated users
    window.location.href = `tel:${provider.phone}`;
  };

  // Render an edit link for the provider's own profile
  if (isOwnProfile) {
    return (
      <Link
        href="/provider/dashboard"
        className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 transition-colors shrink-0"
      >
        <Settings size={14} />
        Edit Profile
      </Link>
    );
  }

  // Default: contact button that dials the provider's phone number
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
    >
      <Phone size={14} />
      Contact
    </button>
  );
}
