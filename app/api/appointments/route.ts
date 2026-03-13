import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession();
  const body = await request.json();
  const {
    service_id: serviceId,
    doctor_id: doctorId,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    notes,
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
  } = body as {
    service_id?: string;
    doctor_id?: string;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
  };

  if (!serviceId || !doctorId || !appointmentDate || !appointmentTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userId = session?.user ? (session.user as { id?: string }).id : null;

  if (userId) {
    const { rows } = await sql`
      insert into appointments (patient_id, doctor_id, service_id, appointment_date, appointment_time, status, notes)
      values (${userId}::uuid, ${doctorId}::uuid, ${serviceId}::uuid, ${appointmentDate}::date, ${appointmentTime}::time, 'booked', ${notes ?? null})
      returning id
    `;
    const appointmentId = (rows[0] as { id: string }).id;
    await sql`
      insert into notifications (user_id, title, message, type)
      values (${userId}::uuid, 'Booking confirmed', ${`Your appointment for ${appointmentDate} at ${(appointmentTime as string).slice(0, 5)} has been booked.`}, 'booking')
    `;
    return NextResponse.json({ id: appointmentId });
  }

  if (!guestName?.trim() || !guestEmail?.trim()) {
    return NextResponse.json(
      { error: "Guest booking requires your name and email." },
      { status: 400 }
    );
  }

  const { rows } = await sql`
    insert into appointments (patient_id, doctor_id, service_id, appointment_date, appointment_time, status, notes, guest_name, guest_email, guest_phone)
    values (null, ${doctorId}::uuid, ${serviceId}::uuid, ${appointmentDate}::date, ${appointmentTime}::time, 'booked', ${notes ?? null}, ${guestName.trim()}, ${guestEmail.trim()}, ${guestPhone?.trim() || null})
    returning id
  `;
  const appointmentId = (rows[0] as { id: string }).id;
  return NextResponse.json({ id: appointmentId });
}
