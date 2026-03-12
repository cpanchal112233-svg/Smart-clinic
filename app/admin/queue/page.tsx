import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { formatTime } from "@/lib/utils";
import { QueueActions } from "./QueueActions";
import { AddToQueueButton } from "./AddToQueueButton";

const today = new Date().toISOString().slice(0, 10);

export default async function AdminQueuePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/admin/queue");

  const { rows: profileRows } = await sql`select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1`;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") redirect("/");

  const { rows: queueRows } = await sql`
    select q.id, q.queue_number, q.status, q.checked_in_at,
           a.id as appointment_id, a.appointment_date, a.appointment_time,
           pat.full_name as patient_name, docp.full_name as doctor_name, d.specialty, s.name as service_name
    from queue_entries q
    join appointments a on a.id = q.appointment_id
    join profiles pat on pat.id = a.patient_id
    join doctors d on d.id = a.doctor_id
    join profiles docp on docp.id = d.profile_id
    join services s on s.id = a.service_id
    where a.appointment_date = ${today}::date
    order by q.queue_number
  `;
  const queue = queueRows as { id: string; queue_number: number; status: string; appointment_id: string; appointment_time: string; patient_name: string; doctor_name: string; specialty: string; service_name: string }[];

  const inQueueIds = new Set(queue.map((q) => q.appointment_id));
  const { rows: todayRows } = await sql`
    select a.id, a.appointment_time, pat.full_name as patient_name, docp.full_name as doctor_name, d.specialty, s.name as service_name
    from appointments a
    join profiles pat on pat.id = a.patient_id
    join doctors d on d.id = a.doctor_id
    join profiles docp on docp.id = d.profile_id
    join services s on s.id = a.service_id
    where a.appointment_date = ${today}::date and a.status in ('booked', 'confirmed', 'checked_in')
    order by a.appointment_time
  `;
  const notInQueue = (todayRows as { id: string; appointment_time: string; patient_name: string; doctor_name: string; specialty: string; service_name: string }[]).filter((a) => !inQueueIds.has(a.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Queue management</h1>
      <p className="mt-2 text-text-muted">Check in patients and update queue status.</p>

      <div className="mt-6">
        <Link href="/admin/dashboard" className="btn-secondary">← Dashboard</Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold text-text">Queue</h2>
          {queue.length === 0 ? (
            <div className="card mt-4 text-center text-text-muted">
              No one in the queue. Add from today&apos;s appointments below.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {queue.map((q) => (
                <li key={q.id} className="card flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {q.queue_number}
                    </span>
                    <div>
                      <p className="font-medium text-text">{q.patient_name}</p>
                      <p className="text-sm text-text-muted">
                        {q.doctor_name} · {q.service_name} · {formatTime(q.appointment_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      q.status === "completed" ? "bg-green-100 text-green-700" :
                      q.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                      "bg-primary/20 text-primary"
                    }`}>
                      {q.status.replace("_", " ")}
                    </span>
                    <QueueActions queueEntryId={q.id} appointmentId={q.appointment_id} status={q.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text">Today&apos;s appointments (not in queue)</h2>
          {notInQueue.length === 0 ? (
            <div className="card mt-4 text-center text-text-muted">
              All today&apos;s appointments are in the queue or completed.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {notInQueue.map((a) => (
                <li key={a.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">{a.patient_name}</p>
                    <p className="text-sm text-text-muted">
                      {a.doctor_name} · {formatTime(a.appointment_time)}
                    </p>
                  </div>
                  <AddToQueueButton appointmentId={a.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
