import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { formatTime } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/admin/dashboard");

  const { rows: profileRows } = await sql`
    select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1
  `;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") redirect("/");

  const { rows: appointmentRows } = await sql`
    select a.id, a.appointment_time, a.status,
           coalesce(pat.full_name, a.guest_name) as patient_name,
           docp.full_name as doctor_name, d.specialty,
           s.name as service_name
    from appointments a
    left join profiles pat on pat.id = a.patient_id
    join doctors d on d.id = a.doctor_id
    join profiles docp on docp.id = d.profile_id
    join services s on s.id = a.service_id
    where a.appointment_date = ${today}::date
    order by a.appointment_time
  `;
  const appointments = appointmentRows as { id: string; appointment_time: string; status: string; patient_name: string; doctor_name: string; specialty: string; service_name: string }[];

  const total = appointments.length;
  const waiting = appointments.filter((a) => ["booked", "confirmed"].includes(a.status)).length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const { rows: docCountRows } = await sql`select count(*)::int as c from doctors where is_available = true`;
  const activeDoctors = (docCountRows[0] as { c: number })?.c ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Admin dashboard</h1>
      <p className="mt-2 text-text-muted">Today&apos;s overview and appointments.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm font-medium text-text-muted">Appointments today</p>
          <p className="mt-1 text-3xl font-bold text-text">{total}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-text-muted">Waiting</p>
          <p className="mt-1 text-3xl font-bold text-primary">{waiting}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-text-muted">Completed today</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-text-muted">Active doctors</p>
          <p className="mt-1 text-3xl font-bold text-text">{activeDoctors}</p>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <Link href="/admin/appointments" className="btn-primary">Appointments</Link>
        <Link href="/admin/queue" className="btn-secondary">Queue</Link>
        <Link href="/admin/doctors" className="btn-secondary">Doctors schedule</Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Today&apos;s appointments</h2>
        {appointments.length === 0 ? (
          <div className="card mt-4 text-center text-text-muted">No appointments today.</div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-text">Time</th>
                  <th className="px-4 py-3 font-medium text-text">Patient</th>
                  <th className="px-4 py-3 font-medium text-text">Doctor</th>
                  <th className="px-4 py-3 font-medium text-text">Service</th>
                  <th className="px-4 py-3 font-medium text-text">Status</th>
                  <th className="px-4 py-3 font-medium text-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{formatTime(a.appointment_time)}</td>
                    <td className="px-4 py-3">{a.patient_name}</td>
                    <td className="px-4 py-3">{a.doctor_name} ({a.specialty})</td>
                    <td className="px-4 py-3">{a.service_name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === "cancelled" ? "bg-red-100 text-red-700" :
                        a.status === "completed" ? "bg-green-100 text-green-700" :
                        a.status === "checked_in" ? "bg-amber-100 text-amber-700" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/appointments?edit=${a.id}`} className="text-primary hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
