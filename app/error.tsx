"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isEnvError =
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("POSTGRES_URL") ||
    error.message?.includes("NEXTAUTH");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text">Something went wrong</h1>
        <p className="mt-2 text-sm text-text-muted">
          {isEnvError
            ? "Configuration issue: check environment variables and database."
            : "An error occurred while loading this page."}
        </p>
        {isEnvError && (
          <p className="mt-3 text-sm text-text-muted">
            Open <Link href="/api/health" className="text-primary underline">/api/health</Link> to see which
            env vars are set. Then set them in Vercel → Settings → Environment Variables and redeploy.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-text hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
