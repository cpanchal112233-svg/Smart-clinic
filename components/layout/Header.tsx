"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";

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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-[2.75rem] items-center">
          <Logo showWordmark={false} />
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                pathname === href ? "text-primary" : "text-text-muted hover:text-text"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-sm text-text-muted">…</span>
          ) : user ? (
            <>
              {isPatient && (
                <Link
                  href="/patient/dashboard"
                  className="text-sm font-medium text-text-muted hover:text-text"
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-text-muted hover:text-text"
                >
                  Admin
                </Link>
              )}
              <Link href="/patient/profile" className="text-sm font-medium text-text-muted hover:text-text">
                Profile
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-text-muted hover:text-text">
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
