import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

function checkSecret() {
  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      { error: "Server misconfigured: NEXTAUTH_SECRET is not set. Add it in Vercel → Settings → Environment Variables and redeploy." },
      { status: 503 }
    );
  }
  return null;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  const err = checkSecret();
  if (err) return err;
  return handler(req, context as any);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  const err = checkSecret();
  if (err) return err;
  return handler(req, context as any);
}
