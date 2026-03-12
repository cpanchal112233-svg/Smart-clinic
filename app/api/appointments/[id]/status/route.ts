import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { AppointmentStatus } from "@/types/database";

const VALID: AppointmentStatus[] = ["booked", "confirmed", "checked_in", "completed", "cancelled"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rows: roleRows } = await sql`
    select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1
  `;
  const role = (roleRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status as AppointmentStatus | undefined;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await sql`
    update appointments set status = ${status} where id = ${id}::uuid
  `;
  return NextResponse.json({ ok: true });
}
