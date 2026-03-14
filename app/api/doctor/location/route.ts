import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getServerSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: profileRows } = await sql`
    select role from profiles where id = ${userId}::uuid limit 1
  `;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "doctor") {
    return NextResponse.json({ error: "Only doctors can set location" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const lat = body.latitude != null ? Number(body.latitude) : null;
  const lng = body.longitude != null ? Number(body.longitude) : null;

  if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
    return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
  }
  if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
    return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
  }

  try {
    await sql`
      update doctors
      set latitude = ${lat}, longitude = ${lng}
      where profile_id = ${userId}::uuid
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
