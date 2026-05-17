"use client";

// Registration page — Client Component.
// Allows users to sign up as either a regular user or a service provider.
// Role selection changes the right-panel copy and the post-registration redirect.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Wrench, ArrowRight, User, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  // Default role is "user"; selecting "provider" changes the right panel
  const [role, setRole] = useState<"user" | "provider">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    // Client-side minimum password length validation
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const result = await register({ name, email, phone, password, role });
    setLoading(false);
    if (result.success) {
      // Providers are redirected to the setup wizard; regular users go to homepage
      router.push(role === "provider" ? "/provider/setup" : "/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left panel — form ────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg">Urban<span className="text-primary">Fix</span></span>
          </Link>

          <h1 className="text-3xl font-extrabold mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>

          {/* Role picker — toggles between user and provider */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { value: "user", label: "I need services", sub: "Find & book professionals", icon: User },
              { value: "provider", label: "I offer services", sub: "Grow your business", icon: Briefcase },
            ] as const).map((opt) => (
              <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                  role === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg",
                  role === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <opt.icon size={16} />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", role === opt.value && "text-primary")}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Name, email and phone fields rendered via array to reduce repetition */}
            {[
              { label: "Full name", value: name, set: setName, type: "text", placeholder: "John Doe" },
              { label: "Email address", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
              { label: "Phone number", value: phone, set: setPhone, type: "tel", placeholder: "+1 (555) 000-0000" },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <label className="text-sm font-semibold">{field.label}</label>
                <input type={field.type} required value={field.value} onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                {/* Password visibility toggle */}
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm mt-2">
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              By signing up you agree to our{" "}
              <span className="text-primary cursor-pointer hover:underline">Terms</span> &{" "}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>

      {/* ── Right panel — role-aware marketing copy ───────────────────── */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-linear-to-br from-primary via-primary to-[oklch(0.45_0.22_262)] text-white px-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative text-center max-w-sm">
          {/* Icon and heading change based on selected role */}
          <div className="text-6xl mb-6">{role === "provider" ? "🔧" : "✨"}</div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            {role === "provider" ? "Join 500+ verified professionals" : "Book services in minutes"}
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            {role === "provider"
              ? "Grow your business, manage bookings, and get discovered by thousands of local customers."
              : "Find trusted professionals, compare prices, and book instantly — all in one place."}
          </p>
          {/* Bullet points also change based on role */}
          <div className="flex flex-col gap-3">
            {(role === "provider"
              ? ["Free to list your business", "Get bookings from local customers", "Manage your profile & services"]
              : ["Verified & background-checked pros", "Transparent pricing, no surprises", "Easy booking & real reviews"]
            ).map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-left backdrop-blur-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
