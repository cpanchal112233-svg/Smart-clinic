import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Math.min(500, Math.max(1, Number(searchParams.get("radius_km")) || 50));

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "Valid lat and lng query parameters required" },
      { status: 400 }
    );
  }

  try {
    const { rows } = await sql`
      select d.id, d.profile_id, d.specialty, d.bio, d.is_available, d.latitude, d.longitude,
             p.full_name, p.avatar_url
      from doctors d
      join profiles p on p.id = d.profile_id
      where d.is_available = true
        and d.latitude is not null
        and d.longitude is not null
    `;

    const withDistance = (rows as { id: string; profile_id: string; specialty: string; bio: string | null; is_available: boolean; latitude: number; longitude: number; full_name: string; avatar_url: string | null }[])
      .map((d) => ({
        ...d,
        distance_km: Math.round(haversineKm(lat, lng, Number(d.latitude), Number(d.longitude)) * 10) / 10,
      }))
      .filter((d) => d.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({ doctors: withDistance });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch nearby doctors" },
      { status: 500 }
    );
  }
}
