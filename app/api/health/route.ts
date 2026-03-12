import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/health – use this to see why the app might be failing on Vercel.
 * Open https://your-app.vercel.app/api/health in the browser.
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {};
  let ok = true;

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  checks.DATABASE_URL_or_POSTGRES_URL = !!dbUrl;
  if (!dbUrl) ok = false;

  checks.NEXTAUTH_SECRET = !!process.env.NEXTAUTH_SECRET;
  if (!process.env.NEXTAUTH_SECRET) ok = false;

  const authUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  checks.NEXTAUTH_URL_or_VERCEL_URL = !!authUrl;
  if (!authUrl) ok = false;

  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      await sql`SELECT 1`;
      checks.database_connection = true;
    } catch (e) {
      checks.database_connection = false;
      checks.database_error = e instanceof Error ? e.message : String(e);
      ok = false;
    }
  } else {
    checks.database_connection = "skipped (no URL)";
  }

  return NextResponse.json({
    ok,
    message: ok
      ? "All checks passed."
      : "One or more checks failed. Set the missing env vars in Vercel → Settings → Environment Variables, then redeploy.",
    checks,
  });
}
