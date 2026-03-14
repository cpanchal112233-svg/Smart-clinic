import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const adminId = (session?.user as { id?: string } | undefined)?.id;
  if (role !== "admin" || !adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = (body.reason as string) || null;
  try {
    const { rowCount } = await sql`
      update doctor_applications
      set status = 'rejected', reviewed_by = ${adminId}::uuid, reviewed_at = now(),
          rejection_reason = ${reason}, updated_at = now()
      where id = ${id}::uuid and status = 'pending'
    `;
    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Application not found or already processed" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Rejection failed" }, { status: 500 });
  }
}
