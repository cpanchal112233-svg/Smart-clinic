import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rows } = await sql`
    select full_name, email, phone from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1
  `;
  const row = rows[0] as { full_name: string; email: string; phone: string | null } | undefined;
  if (!row) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { full_name: fullName, phone } = body as { full_name?: string; phone?: string | null };
  await sql`
    update profiles
    set full_name = coalesce(${fullName ?? null}, full_name),
        phone = ${phone !== undefined ? phone : null},
        updated_at = now()
    where id = ${(session.user as { id: string }).id}::uuid
  `;
  return NextResponse.json({ ok: true });
}
