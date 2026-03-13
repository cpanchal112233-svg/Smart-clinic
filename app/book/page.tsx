import { sql } from "@/lib/db";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const dynamic = "force-dynamic";
import type { Service } from "@/types/database";
import type { Doctor } from "@/types/database";

async function getServices(): Promise<Service[]> {
  const { rows } = await sql`
    select id, name, description, duration_minutes, price, is_active, created_at
    from services where is_active = true order by name
  `;
  return rows as Service[];
}

async function getDoctors(): Promise<(Doctor & { full_name: string })[]> {
  const { rows } = await sql`
    select d.id, d.profile_id, d.specialty, d.bio, d.is_available, d.created_at,
           p.full_name
    from doctors d
    join profiles p on p.id = d.profile_id
    where d.is_available = true
    order by d.specialty
  `;
  return rows as (Doctor & { full_name: string })[];
}

export default async function BookPage() {
  const [services, doctors] = await Promise.all([getServices(), getDoctors()]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Book an appointment</h1>
      <p className="mt-2 text-text-muted">
        Choose your service, doctor, and a convenient time. No account needed — enter your details at the end to confirm.
      </p>
      <BookingFlow services={services} doctors={doctors} />
    </div>
  );
}
