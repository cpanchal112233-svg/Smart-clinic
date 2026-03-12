import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
import type { Service } from "@/types/database";

async function getServices(): Promise<Service[]> {
  const { rows } = await sql`
    select id, name, description, duration_minutes, price, is_active, created_at
    from services
    where is_active = true
    order by name
  `;
  return rows as Service[];
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-text">Our Services</h1>
      <p className="mt-2 text-text-muted">
        Choose a service to see availability and book an appointment.
      </p>

      {services.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-text-muted">No services listed yet.</p>
          <p className="mt-2 text-sm text-text-muted">
            Check back soon or contact the clinic.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="card">
              <h2 className="font-semibold text-text">{s.name}</h2>
              {s.description && (
                <p className="mt-2 text-sm text-text-muted">{s.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  {s.duration_minutes} min
                  {s.price != null && ` · $${Number(s.price).toFixed(0)}`}
                </span>
                <Link href={`/book?service=${s.id}`} className="btn-primary text-sm">
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/book" className="btn-secondary">
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
