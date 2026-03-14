import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { DoctorApplicationsList } from "./DoctorApplicationsList";

export const dynamic = "force-dynamic";

export default async function AdminDoctorApplicationsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/admin/doctor-applications");

  const { rows: profileRows } = await sql`
    select role from profiles where id = ${(session.user as { id: string }).id}::uuid limit 1
  `;
  const role = (profileRows[0] as { role: string } | undefined)?.role;
  if (role !== "admin") redirect("/");

  const { rows } = await sql`
    select id, profile_id, full_name, email, specialty, document_urls, status,
           reviewed_at, rejection_reason, created_at
    from doctor_applications
    order by created_at desc
  `;
  const applications = rows as {
    id: string;
    profile_id: string;
    full_name: string;
    email: string;
    specialty: string;
    document_urls: string[];
    status: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
    created_at: string;
  }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Doctor applications</h1>
          <p className="mt-2 text-slate-300">
            Review and approve or reject doctor registrations. Approved applicants can log in as doctors.
          </p>
        </div>
        <Link href="/admin/dashboard" className="btn-secondary">
          ← Dashboard
        </Link>
      </div>

      <DoctorApplicationsList applications={applications} />
    </div>
  );
}
