import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import { CancelButton } from "./CancelButton";

export const dynamic = "force-dynamic";

export default async function PatientAppointmentsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/patient/appointments");
  const userId = (session.user as { id: string }).id;

  const { rows } = await sql`
    select a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
           s.name as service_name, p.full_name as doctor_name, d.specialty
    from appointments a
    join services s on s.id = a.service_id
    join doctors d on d.id = a.doctor_id
    join profiles p on p.id = d.profile_id
    where a.patient_id = ${userId}::uuid
    order by a.appointment_date desc, a.appointment_time desc
  `;
  const appointments = rows as { id: string; appointment_date: string; appointment_time: string; status: string; notes: string | null; service_name: string; doctor_name: string; specialty: string }[];

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter(
    (a) => ["booked", "confirmed", "checked_in"].includes(a.status) && a.appointment_date >= today
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled" || a.appointment_date < today
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Appointments</h1>
      <p className="mt-2 text-slate-300">View and manage your appointments.</p>

      <div className="mt-6 flex gap-4">
        <Link href="/book" className="btn-primary">
          Book new appointment
        </Link>
        <Link href="/patient/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="card mt-4 text-center text-slate-300">
            No upcoming appointments. <Link href="/book" className="text-primary hover:underline">Book one</Link>.
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {upcoming.map((a) => (
              <li key={a.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{a.service_name}</p>
                  <p className="text-sm text-slate-300">
                    {a.doctor_name} · {a.specialty}
                  </p>
                  <p className="text-white">
                    {formatDate(a.appointment_date)} at {formatTime(a.appointment_time)}
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === "cancelled" ? "bg-red-500/20 text-red-200" :
                    a.status === "completed" ? "bg-green-500/20 text-green-200" :
                    "bg-primary/20 text-primary"
                  }`}>
                    {a.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!["cancelled", "completed"].includes(a.status) && (
                    <CancelButton appointmentId={a.id} />
                  )}
                  <Link href={`/book/confirmation?id=${a.id}`} className="btn-secondary text-sm">
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">History</h2>
        {past.length === 0 ? (
          <div className="card mt-4 text-center text-slate-400">No past appointments.</div>
        ) : (
          <ul className="mt-4 space-y-2">
            {past.map((a) => (
              <li key={a.id} className="card flex items-center justify-between">
                <div>
                  <span className="font-medium text-white">{a.service_name}</span>
                  <span className="ml-2 text-sm text-slate-400">
                    {formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-400">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
