"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Sign up failed");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="card">
        <h1 className="text-2xl font-bold text-white">Create account (Patient)</h1>
        <p className="mt-1 text-sm text-slate-300">
          Sign up to book and manage your appointments as a patient.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Are you a doctor?{" "}
          <Link href="/signup/doctor" className="text-primary hover:underline">
            Apply here
          </Link>
          .
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-400/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-200">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-glass mt-1"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass mt-1"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass mt-1"
            />
            <p className="mt-1 text-xs text-slate-400">At least 6 characters</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link href="/signup/doctor" className="font-medium text-primary hover:underline">
            Apply as doctor
          </Link>
        </p>
      </div>
      </div>
    </section>
  );
}
