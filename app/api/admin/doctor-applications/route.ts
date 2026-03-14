import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { rows } = await sql`
      select id, profile_id, full_name, email, specialty, document_urls, status,
             reviewed_by, reviewed_at, rejection_reason, created_at
      from doctor_applications
      order by created_at desc
    `;
    return NextResponse.json({ applications: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}
