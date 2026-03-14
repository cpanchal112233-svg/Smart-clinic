"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorSignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [documentLinks, setDocumentLinks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const urls = documentLinks
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/auth/signup/doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        specialty,
        document_urls: urls,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }
    router.push("/login?message=pending");
    router.refresh();
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-white">Apply as a doctor</h1>
          <p className="mt-1 text-sm text-slate-300">
            Create an account and submit your documents. Higher authorities will review
            and approve your access before you can log in.
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
              <label htmlFor="specialty" className="block text-sm font-medium text-slate-200">
                Specialty
              </label>
              <input
                id="specialty"
                type="text"
                required
                placeholder="e.g. General Practice, Cardiology"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
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
            <div>
              <label htmlFor="docLinks" className="block text-sm font-medium text-slate-200">
                Document links (optional)
              </label>
              <textarea
                id="docLinks"
                rows={3}
                placeholder="Paste links to your credentials (license, ID, etc.). One per line or comma-separated."
                value={documentLinks}
                onChange={(e) => setDocumentLinks(e.target.value)}
                className="input-glass mt-1"
              />
              <p className="mt-1 text-xs text-slate-400">
                You can add links to uploaded documents (e.g. Google Drive, Dropbox) for
                verification. Required documents may be requested during review.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Submitting…" : "Submit application"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
            {" · "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up as patient
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
