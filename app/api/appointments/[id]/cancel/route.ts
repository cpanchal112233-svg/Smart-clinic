import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const { rowCount } = await sql`
    update appointments
    set status = 'cancelled'
    where id = ${id}::uuid and patient_id = ${userId}::uuid
  `;
  if (rowCount === 0) {
    return NextResponse.json({ error: "Appointment not found or not yours" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
