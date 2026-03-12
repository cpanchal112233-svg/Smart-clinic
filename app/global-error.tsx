"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 p-6 font-sans">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Application error</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isEnvError
              ? "Configuration issue: set DATABASE_URL (or POSTGRES_URL), NEXTAUTH_SECRET, and run the SQL schema in Neon. NEXTAUTH_URL is optional on Vercel (uses VERCEL_URL)."
              : "A critical error occurred. Check the server logs or try again."}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            If deployed on Vercel, add env vars in Settings → Environment Variables, then redeploy.
            You can also open <strong>/api/health</strong> on your deployment to see which checks pass.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
