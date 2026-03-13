import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/book");

  const { rows } = await sql`
    select a.id, a.patient_id, a.appointment_date, a.appointment_time, a.status, a.notes,
           p.full_name as doctor_name, d.specialty,
           s.name as service_name
    from appointments a
    join doctors d on d.id = a.doctor_id
    join profiles p on p.id = d.profile_id
    join services s on s.id = a.service_id
    where a.id = ${id}::uuid
    limit 1
  `;
  const appointment = rows[0] as { id: string; patient_id: string | null; appointment_date: string; appointment_time: string; status: string; notes: string | null; doctor_name: string; specialty: string; service_name: string } | undefined;
  if (!appointment) redirect("/book");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="card text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text">Booking confirmed</h1>
        <p className="mt-2 text-text-muted">
          Your appointment has been scheduled. You will receive a reminder before your visit.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
          <p className="text-sm font-medium text-text-muted">Confirmation number</p>
          <p className="mt-1 font-mono font-semibold text-text">{id.slice(0, 8).toUpperCase()}</p>

          <div className="mt-6 space-y-2">
            <p><span className="text-text-muted">Doctor:</span> {appointment.doctor_name} ({appointment.specialty})</p>
            <p><span className="text-text-muted">Service:</span> {appointment.service_name}</p>
            <p><span className="text-text-muted">Date:</span> {formatDate(appointment.appointment_date)}</p>
            <p><span className="text-text-muted">Time:</span> {formatTime(appointment.appointment_time)}</p>
            <p><span className="text-text-muted">Status:</span> <span className="capitalize">{appointment.status}</span></p>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            <strong>Clinic location:</strong> 123 Health Street, Medical Center, Suite 100
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {appointment.patient_id ? (
            <Link href="/patient/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/" className="btn-primary">
              Home
            </Link>
          )}
          <Link href="/book" className="btn-secondary">
            Book another
          </Link>
        </div>
      </div>
    </div>
  );
}
