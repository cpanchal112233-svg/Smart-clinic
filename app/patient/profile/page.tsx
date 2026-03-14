import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/login?redirect=/patient/profile");
  const userId = (session.user as { id: string }).id;

  const { rows } = await sql`
    select full_name, email, phone from profiles where id = ${userId}::uuid limit 1
  `;
  const profile = rows[0] as { full_name: string; email: string; phone: string | null } | undefined;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Profile & settings</h1>
      <p className="mt-2 text-slate-300">Update your contact details.</p>

      <div className="mt-8 card">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          email={profile?.email ?? session.user?.email ?? ""}
          phone={profile?.phone ?? ""}
        />
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/patient/dashboard" className="text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
