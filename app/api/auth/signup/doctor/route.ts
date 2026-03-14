import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      full_name: fullName,
      specialty,
      document_urls,
    } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      specialty?: string;
      document_urls?: string[];
    };

    if (!email || !password || !fullName || !specialty) {
      return NextResponse.json(
        { error: "Missing email, password, full name, or specialty" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await sql`select id from profiles where email = ${email} limit 1`;
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const urls = Array.isArray(document_urls)
      ? document_urls.filter((u) => typeof u === "string" && u.trim().length > 0)
      : [];

    const { rows: profileRows } = await sql`
      insert into profiles (full_name, email, password_hash, role)
      values (${fullName}, ${email}, ${password_hash}, 'doctor_pending')
      returning id
    `;
    const profileId = (profileRows[0] as { id: string }).id;
    await sql`
      insert into doctor_applications (profile_id, full_name, email, specialty, document_urls, status)
      values (${profileId}, ${fullName}, ${email}, ${specialty}, ${urls}, 'pending')
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[signup/doctor]", e);
    return NextResponse.json(
      { error: "Doctor registration failed" },
      { status: 500 }
    );
  }
}
