import Link from "next/link";
import Image from "next/image";
import { sql } from "@/lib/db";
import { FindDoctorsNearby } from "./FindDoctorsNearby";

export const dynamic = "force-dynamic";
import type { Doctor } from "@/types/database";

type DoctorRow = Doctor & { full_name: string; avatar_url: string | null };

async function getDoctors(): Promise<DoctorRow[]> {
  const { rows } = await sql`
    select d.id, d.profile_id, d.specialty, d.bio, d.is_available, d.latitude, d.longitude, d.created_at,
           p.full_name, p.avatar_url
    from doctors d
    join profiles p on p.id = d.profile_id
    where d.is_available = true
    order by d.specialty
  `;
  return rows as DoctorRow[];
}

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Our Doctors</h1>
      <p className="mt-2 text-slate-300">
        Experienced professionals. Choose a doctor to book an appointment. Use your location to find doctors nearby for instant treatment.
      </p>

      <FindDoctorsNearby className="mt-6" />

      {doctors.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-slate-300">No doctors listed yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Check back soon or contact the clinic.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <div key={d.id} className="card flex flex-col">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/10 border border-white/10">
                  {d.avatar_url ? (
                    <Image
                      src={d.avatar_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary">
                      {d.full_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{d.full_name ?? "Doctor"}</h2>
                  <p className="text-sm text-primary">{d.specialty}</p>
                  {d.bio && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                      {d.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/book?doctor=${d.id}`} className="btn-primary text-sm">
                  Book appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/book" className="btn-secondary">
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
