import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name: fullName } = body as { email?: string; password?: string; full_name?: string };
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing email, password, or full name" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await sql`select id from profiles where email = ${email} limit 1`;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await sql`
      insert into profiles (full_name, email, password_hash, role)
      values (${fullName}, ${email}, ${password_hash}, 'patient')
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
