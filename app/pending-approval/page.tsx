import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "doctor_pending") {
    redirect(role === "doctor" || role === "admin" ? "/admin/dashboard" : "/patient/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="card text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl text-amber-400">
          ⏳
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">Application under review</h1>
        <p className="mt-2 text-slate-300">
          Your doctor registration is pending approval from our team. We will verify your
          documents and notify you once your account is approved. This usually takes 1–2
          business days.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          You can sign out and return later to check your status.
        </p>
        <Link href="/api/auth/signout" className="mt-6 inline-block btn-secondary">
          Sign out
        </Link>
      </div>
    </div>
  );
}
