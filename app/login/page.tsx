"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-100">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = React.useState("admin@calenpulse.internal");
  const [password, setPassword] = React.useState("AdminPass123!");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify credentials.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred.");
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: "admin" | "staff") => {
    if (role === "admin") {
      setEmail("admin@calenpulse.internal");
      setPassword("AdminPass123!");
    } else {
      setEmail("staff@calenpulse.internal");
      setPassword("StaffPass123!");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/book" className="inline-flex items-center space-x-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            CP
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CalenPulse
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Staff Operational Console
        </h2>
        <p className="mt-1 text-xs text-stone-400">
          Secure credentials authentication for administrators and studio staff
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-stone-950 border border-stone-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@calenpulse.internal"
                  className="pl-9 bg-stone-900 border-stone-800 text-stone-100 text-xs placeholder:text-stone-600 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 bg-stone-900 border-stone-800 text-stone-100 text-xs placeholder:text-stone-600 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full h-10 text-xs font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Operations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* 1-Click Demo Profiles */}
          <div className="pt-4 border-t border-stone-800/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 text-center mb-3">
              One-Click Demo Authentication
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-indigo-500/50 hover:bg-stone-850 text-left transition-all text-xs"
              >
                <div className="flex items-center space-x-1 font-semibold text-stone-200">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Admin</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">Full privileges</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("staff")}
                className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-indigo-500/50 hover:bg-stone-850 text-left transition-all text-xs"
              >
                <div className="flex items-center space-x-1 font-semibold text-stone-200">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Staff</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">Ops scheduling</p>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/book"
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center"
          >
            ← Return to Public Booking Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
