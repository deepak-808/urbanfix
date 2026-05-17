"use client";

// Login page — Client Component.
// Two-column layout: login form on the left, marketing panel on the right.
// Includes demo account quick-select buttons for easy testing.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Wrench, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// Pre-configured demo accounts for quick testing of different roles
const DEMO_ACCOUNTS = [
  { label: "User", email: "user@demo.com", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { label: "Provider", email: "provider@demo.com", color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
  { label: "Admin", email: "admin@demo.com", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Submits credentials to the auth store; redirects to homepage on success
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left panel — form ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg">Urban<span className="text-primary">Fix</span></span>
          </Link>

          <h1 className="text-3xl font-extrabold mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">Sign up free</Link>
          </p>

          {/* Demo account quick-select buttons (any password works) */}
          <div className="rounded-xl border bg-muted/30 p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-2.5 font-medium">Try a demo account (any password):</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((acc) => (
                // Clicking pre-fills the form with demo credentials
                <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword("password"); }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${acc.color}`}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                {/* Toggle password visibility */}
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm mt-2">
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right panel — marketing illustration ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-linear-to-br from-primary via-primary to-[oklch(0.45_0.22_262)] text-white px-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative text-center max-w-sm">
          <div className="text-6xl mb-6">🏠</div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">Your home deserves the best</h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            Trusted by 10,000+ homeowners. Access verified professionals for every home service need.
          </p>
          {/* Trust bullet points */}
          <div className="flex flex-col gap-3">
            {["Background-checked professionals", "Real reviews from real customers", "On-time, every time guarantee"].map((item) => (
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
