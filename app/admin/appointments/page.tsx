import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import { StatusFilter } from "./StatusFilter";
import { UpdateStatusForm } from "./UpdateStatusForm";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/admin/appointments");

  const { rows: profileRows } = await sql`select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1`;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin" && role !== "doctor") redirect("/");

  const { status } = await searchParams;
  let query = sql`
    select a.id, a.appointment_date, a.appointment_time, a.status,
           pat.full_name as patient_name, pat.email as patient_email,
           docp.full_name as doctor_name, d.specialty,
           s.name as service_name
    from appointments a
    join profiles pat on pat.id = a.patient_id
    join doctors d on d.id = a.doctor_id
    join profiles docp on docp.id = d.profile_id
    join services s on s.id = a.service_id
    order by a.appointment_date desc, a.appointment_time desc
    limit 100
  `;
  if (status && status !== "all") {
    query = sql`
      select a.id, a.appointment_date, a.appointment_time, a.status,
             pat.full_name as patient_name, pat.email as patient_email,
             docp.full_name as doctor_name, d.specialty,
             s.name as service_name
      from appointments a
      join profiles pat on pat.id = a.patient_id
      join doctors d on d.id = a.doctor_id
      join profiles docp on docp.id = d.profile_id
      join services s on s.id = a.service_id
      where a.status = ${status}
      order by a.appointment_date desc, a.appointment_time desc
      limit 100
    `;
  }
  const { rows: appointments } = await query;
  const list = appointments as { id: string; appointment_date: string; appointment_time: string; status: string; patient_name: string; patient_email: string; doctor_name: string; specialty: string; service_name: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Appointments</h1>
      <p className="mt-2 text-text-muted">Manage all appointments.</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href="/admin/dashboard" className="btn-secondary">← Dashboard</Link>
        <StatusFilter current={status ?? "all"} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-text">Date</th>
              <th className="px-4 py-3 font-medium text-text">Time</th>
              <th className="px-4 py-3 font-medium text-text">Patient</th>
              <th className="px-4 py-3 font-medium text-text">Doctor</th>
              <th className="px-4 py-3 font-medium text-text">Service</th>
              <th className="px-4 py-3 font-medium text-text">Status</th>
              <th className="px-4 py-3 font-medium text-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No appointments match the filter.
                </td>
              </tr>
            ) : (
              list.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDate(a.appointment_date)}</td>
                  <td className="px-4 py-3">{formatTime(a.appointment_time)}</td>
                  <td className="px-4 py-3">
                    {a.patient_name}
                    <br />
                    <span className="text-xs text-text-muted">{a.patient_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.doctor_name}
                    <br />
                    <span className="text-xs text-text-muted">{a.specialty}</span>
                  </td>
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
                    <UpdateStatusForm appointmentId={a.id} currentStatus={a.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
