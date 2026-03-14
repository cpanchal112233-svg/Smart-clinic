import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/book", label: "Book Appointment" },
  { href: "/login", label: "Login" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo animated={false} className="text-base text-slate-200" />
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-300 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} SmartClinic. Modern healthcare, made easier.
        </p>
      </div>
    </footer>
  );
}
