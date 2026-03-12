import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: profileRows } = await sql`select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1`;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const appointmentId = body.appointmentId as string;
  if (!appointmentId) return NextResponse.json({ error: "appointmentId required" }, { status: 400 });

  const { rows: existing } = await sql`select id from queue_entries where appointment_id = ${appointmentId}::uuid limit 1`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Already in queue" }, { status: 400 });
  }

  const { rows: maxRows } = await sql`select coalesce(max(queue_number), 0)::int + 1 as next_num from queue_entries`;
  const nextNum = (maxRows[0] as { next_num: number }).next_num;

  await sql`update appointments set status = 'checked_in' where id = ${appointmentId}::uuid`;
  await sql`
    insert into queue_entries (appointment_id, queue_number, status, checked_in_at)
    values (${appointmentId}::uuid, ${nextNum}, 'waiting', now())
  `;

  return NextResponse.json({ ok: true });
}
