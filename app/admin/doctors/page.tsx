import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminDoctorsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/admin/doctors");

  const { rows: profileRows } = await sql`select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1`;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") redirect("/");

  const { rows: doctors } = await sql`
    select d.id, d.specialty, d.is_available, p.full_name
    from doctors d
    join profiles p on p.id = d.profile_id
    order by d.specialty
  `;

  const { rows: scheduleRows } = await sql`
    select doctor_id, day_of_week, start_time, end_time
    from doctor_schedules
    order by doctor_id, day_of_week
  `;
  const schedulesByDoctor = (scheduleRows as { doctor_id: string; day_of_week: number; start_time: string; end_time: string }[]).reduce<Record<string, { day_of_week: number; start_time: string; end_time: string }[]>>((acc, s) => {
    if (!acc[s.doctor_id]) acc[s.doctor_id] = [];
    acc[s.doctor_id].push({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time });
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Doctors & schedule</h1>
      <p className="mt-2 text-text-muted">View doctor availability.</p>

      <div className="mt-6">
        <Link href="/admin/dashboard" className="btn-secondary">← Dashboard</Link>
      </div>

      <div className="mt-8 space-y-6">
        {doctors.length === 0 ? (
          <div className="card text-center text-text-muted">No doctors in the system.</div>
        ) : (
          (doctors as { id: string; specialty: string; is_available: boolean; full_name: string }[]).map((d) => (
            <div key={d.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-text">{d.full_name}</h2>
                  <p className="text-sm text-primary">{d.specialty}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                    d.is_available ? "bg-green-100 text-green-700" : "bg-slate-100 text-text-muted"
                  }`}>
                    {d.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-text-muted">Schedule</h3>
                {(!schedulesByDoctor[d.id] || schedulesByDoctor[d.id].length === 0) ? (
                  <p className="mt-2 text-sm text-text-muted">No schedule set.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {schedulesByDoctor[d.id]
                      .sort((a, b) => a.day_of_week - b.day_of_week)
                      .map((s) => (
                        <li key={s.day_of_week}>
                          {DAYS[s.day_of_week]}: {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
