import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  const doctorId = request.nextUrl.searchParams.get("doctor_id");
  const date = request.nextUrl.searchParams.get("date");
  if (!doctorId || !date) {
    return NextResponse.json(
      { error: "doctor_id and date required" },
      { status: 400 }
    );
  }
  const d = new Date(date + "T00:00:00");
  const dayOfWeek = d.getDay();

  const { rows: schedules } = await sql`
    select start_time, end_time
    from doctor_schedules
    where doctor_id = ${doctorId}::uuid and day_of_week = ${dayOfWeek}
  `;

  const slotSizeMinutes = 30;
  const slots: string[] = [];

  for (const s of schedules as { start_time: string; end_time: string }[]) {
    const [sh, sm] = s.start_time.split(":").map(Number);
    const [eh, em] = s.end_time.split(":").map(Number);
    let min = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (min + slotSizeMinutes <= endMin) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      min += slotSizeMinutes;
    }
  }

  const { rows: existing } = await sql`
    select appointment_time
    from appointments
    where doctor_id = ${doctorId}::uuid and appointment_date = ${date}::date
      and status in ('booked', 'confirmed', 'checked_in')
  `;
  const taken = new Set((existing as { appointment_time: string }[]).map((r) => r.appointment_time));
  const available = slots.filter((t) => !taken.has(t));

  return NextResponse.json({ slots: available });
}
