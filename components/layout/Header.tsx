"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const publicNav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/book", label: "Book Appointment" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const isPatient = role === "patient";
  const isAdmin = role === "admin" || role === "doctor";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="SmartClinic – Home">
          <Image src="/logo.png" alt="SmartClinic" width={44} height={44} className="block" priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                pathname === href ? "text-primary" : "text-slate-300 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-sm text-slate-400">…</span>
          ) : user ? (
            <>
              {isPatient && (
                <Link
                  href="/patient/dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Admin
                </Link>
              )}
              <Link href="/patient/profile" className="text-sm font-medium text-slate-300 hover:text-white">
                Profile
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
