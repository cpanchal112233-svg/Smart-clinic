import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await getServerSession();
  const { redirect: redirectTo } = await searchParams;
  const target = redirectTo ?? "/patient/dashboard";
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin" || role === "doctor") {
    redirect("/admin/dashboard");
  }
  redirect(target);
}
