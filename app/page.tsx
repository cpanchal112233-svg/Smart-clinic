import Link from "next/link";
import { sql } from "@/lib/db";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    const { rows } = await sql`
      select id, name, description, duration_minutes, price
      from services
      where is_active = true
      order by name
    `;
    return (rows as { id: string; name: string; description: string | null; duration_minutes: number; price: number | null }[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getServices();
  const displayServices = services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
            Modern healthcare, made easier.
          </h1>
          <p className="mt-6 text-lg text-text-muted sm:text-xl">
            Book appointments, manage visits, and stay connected through one
            seamless clinic experience.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/book" className="btn-primary text-base px-6 py-3">
              Book Appointment
            </Link>
            <Link href="/services" className="btn-secondary text-base px-6 py-3">
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted care */}
      <section className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold text-text sm:text-3xl">
            Trusted care, when you need it
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-text-muted">
            SmartClinic brings your clinic and patients together with online
            booking, reminders, and a simple dashboard for staff and doctors.
          </p>
        </div>
      </section>

      {/* Services - all from DB or fallback */}
      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">
            Our Services
          </h2>
          <p className="mt-2 text-text-muted">
            From checkups to consultations, we offer a range of services.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((s) => (
              <div key={s.id} className="card">
                <h3 className="font-semibold text-text">{s.name}</h3>
                <p className="mt-2 text-sm text-text-muted">{s.description ?? ""}</p>
                <div className="mt-2 text-xs text-text-muted">
                  {s.duration_minutes} min{s.price != null && ` · $${Number(s.price).toFixed(0)}`}
                </div>
                <Link
                  href={s.id.startsWith("fallback") ? "/services" : `/book?service=${s.id}`}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {s.id.startsWith("fallback") ? "Learn more →" : "Book →"}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services" className="btn-secondary">
              View all services
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">
            Our Doctors
          </h2>
          <p className="mt-2 text-text-muted">
            Experienced professionals ready to help.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/doctors" className="btn-primary">
              Meet our doctors
            </Link>
          </div>
        </div>
      </section>

      {/* How booking works */}
      <section className="bg-background px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold text-text sm:text-3xl">
            How booking works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, title: "Choose service", text: "Pick the type of visit you need." },
              { step: 2, title: "Choose doctor", text: "Select your preferred doctor." },
              { step: 3, title: "Pick date & time", text: "See available slots and book." },
              { step: 4, title: "Confirm", text: "Get confirmation and reminders." },
            ].map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {step}
                </div>
                <h3 className="mt-4 font-medium text-text">{title}</h3>
                <p className="mt-1 text-sm text-text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-primary px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Ready to book?
          </h2>
          <p className="mt-4 text-white/90">
            Create an account or sign in to manage your appointments.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-primary hover:bg-slate-100"
            >
              Sign up
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center rounded-lg border border-white/80 bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Book without account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
