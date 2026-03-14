import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const adminId = (session?.user as { id?: string } | undefined)?.id;
  if (role !== "admin" || !adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const { rows } = await sql`
      select profile_id, full_name, email, specialty, status
      from doctor_applications
      where id = ${id}::uuid and status = 'pending'
      limit 1
    `;
    const app = rows[0] as { profile_id: string; full_name: string; email: string; specialty: string } | undefined;
    if (!app) {
      return NextResponse.json(
        { error: "Application not found or already processed" },
        { status: 404 }
      );
    }

    await sql`
      update profiles set role = 'doctor', updated_at = now()
      where id = ${app.profile_id}::uuid
    `;
    await sql`
      insert into doctors (profile_id, specialty)
      values (${app.profile_id}::uuid, ${app.specialty})
    `;
    await sql`
      update doctor_applications
      set status = 'approved', reviewed_by = ${adminId}::uuid, reviewed_at = now(), updated_at = now()
      where id = ${id}::uuid
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
