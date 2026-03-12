import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?redirect=/patient/dashboard");
  }
  const userId = (session.user as { id: string }).id;

  const { rows: profileRows } = await sql`select full_name, role from profiles where id = ${userId}::uuid limit 1`;
  const profile = profileRows[0] as { full_name: string; role: string } | undefined;
  if (!profile || profile.role !== "patient") redirect("/");

  const today = new Date().toISOString().slice(0, 10);
  const { rows: upcomingRows } = await sql`
    select a.id, a.appointment_date, a.appointment_time, a.status,
           s.name as service_name, p.full_name as doctor_name, d.specialty
    from appointments a
    join services s on s.id = a.service_id
    join doctors d on d.id = a.doctor_id
    join profiles p on p.id = d.profile_id
    where a.patient_id = ${userId}::uuid and a.status in ('booked', 'confirmed', 'checked_in')
      and a.appointment_date >= ${today}
    order by a.appointment_date, a.appointment_time
    limit 5
  `;
  const upcoming = upcomingRows as { id: string; appointment_date: string; appointment_time: string; status: string; service_name: string; doctor_name: string; specialty: string }[];

  const { rows: recentRows } = await sql`
    select a.id, a.appointment_date, a.appointment_time, a.status, s.name as service_name
    from appointments a
    join services s on s.id = a.service_id
    where a.patient_id = ${userId}::uuid
    order by a.appointment_date desc, a.appointment_time desc
    limit 5
  `;
  const recent = recentRows as { id: string; appointment_date: string; appointment_time: string; status: string; service_name: string }[];

  const { rows: notifRows } = await sql`
    select id, title, message, is_read, created_at from notifications
    where user_id = ${userId}::uuid order by created_at desc limit 5
  `;
  const notifications = notifRows as { id: string; title: string; message: string; is_read: boolean; created_at: string }[];

  const nextAppointment = upcoming[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">
        Welcome back, {profile.full_name?.split(" ")[0] ?? "there"}
      </h1>
      <p className="mt-1 text-text-muted">Here’s your appointment overview.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/book" className="card group block border border-slate-200 transition hover:border-primary/30">
          <span className="text-2xl">📅</span>
          <h2 className="mt-2 font-semibold text-text group-hover:text-primary">Book new appointment</h2>
          <p className="mt-1 text-sm text-text-muted">Schedule a visit with a doctor.</p>
        </Link>
        <Link href="/patient/appointments" className="card group block border border-slate-200 transition hover:border-primary/30">
          <span className="text-2xl">📋</span>
          <h2 className="mt-2 font-semibold text-text group-hover:text-primary">Appointment history</h2>
          <p className="mt-1 text-sm text-text-muted">View and manage past visits.</p>
        </Link>
        <Link href="/patient/profile" className="card group block border border-slate-200 transition hover:border-primary/30">
          <span className="text-2xl">👤</span>
          <h2 className="mt-2 font-semibold text-text group-hover:text-primary">Profile & settings</h2>
          <p className="mt-1 text-sm text-text-muted">Update your details.</p>
        </Link>
      </div>

      {nextAppointment && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Next appointment</h2>
          <div className="card mt-4 border border-primary/20 bg-primary/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-text">{nextAppointment.service_name}</p>
                <p className="text-sm text-text-muted">
                  {nextAppointment.doctor_name} · {nextAppointment.specialty}
                </p>
                <p className="mt-2 text-text">
                  {formatDate(nextAppointment.appointment_date)} at {formatTime(nextAppointment.appointment_time)}
                </p>
                <span className="mt-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                  {nextAppointment.status}
                </span>
              </div>
              <div className="flex gap-2">
                <Link href={`/patient/appointments?highlight=${nextAppointment.id}`} className="btn-secondary text-sm">
                  View
                </Link>
                <Link href="/book" className="btn-primary text-sm">
                  Reschedule
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {!nextAppointment && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Upcoming appointments</h2>
          <div className="card mt-4 text-center text-text-muted">
            <p>No upcoming appointments.</p>
            <Link href="/book" className="mt-2 inline-block text-primary hover:underline">
              Book one now
            </Link>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text">Recent activity</h2>
        {recent.length === 0 ? (
          <div className="card mt-4 text-center text-text-muted">
            No appointments yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((a) => (
              <li key={a.id} className="card flex items-center justify-between">
                <div>
                  <span className="font-medium">{a.service_name}</span>
                  <span className="ml-2 text-sm text-text-muted">
                    {formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-text-muted">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {notifications.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Notifications</h2>
          <ul className="mt-4 space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className={`card ${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
                <p className="font-medium text-text">{n.title}</p>
                <p className="text-sm text-text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
