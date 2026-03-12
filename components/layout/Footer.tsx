import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/book", label: "Book Appointment" },
  { href: "/login", label: "Login" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-semibold text-primary">SmartClinic</span>
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-text-muted hover:text-text"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          © {new Date().getFullYear()} SmartClinic. Modern healthcare, made easier.
        </p>
      </div>
    </footer>
  );
}
