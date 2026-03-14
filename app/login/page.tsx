"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthPageBackground from "@/components/auth/AuthPageBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/patient/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      const msg =
        result.error === "CredentialsSignin"
          ? "Invalid email or password."
          : result.error === "Configuration"
          ? "Server configuration error. Ensure NEXTAUTH_SECRET is set in Vercel and redeploy."
          : result.error;
      setError(msg);
      return;
    }
    if (result?.ok) {
      router.push(`/login/success?${new URLSearchParams({ redirect }).toString()}`);
      router.refresh();
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-text">Sign in</h1>
        <p className="mt-1 text-sm text-text-muted">
          Enter your email and password to access your account.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-text shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-text shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <AuthPageBackground />
      <Suspense fallback={<div className="relative z-10 mx-auto max-w-md px-4 py-16 text-center text-text-muted">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
