import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { QueueStatus } from "@/types/database";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: profileRows } = await sql`select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1`;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const queueEntryId = body.queueEntryId as string;
  const status = body.status as QueueStatus;
  if (!queueEntryId || !status) {
    return NextResponse.json({ error: "queueEntryId and status required" }, { status: 400 });
  }
  if (!["waiting", "in_progress", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { rows: entryRows } = await sql`select appointment_id from queue_entries where id = ${queueEntryId}::uuid limit 1`;
  const entry = entryRows[0] as { appointment_id: string } | undefined;
  if (!entry) return NextResponse.json({ error: "Queue entry not found" }, { status: 404 });

  await sql`update queue_entries set status = ${status} where id = ${queueEntryId}::uuid`;
  if (status === "completed") {
    await sql`update appointments set status = 'completed' where id = ${entry.appointment_id}::uuid`;
  }

  return NextResponse.json({ ok: true });
}
