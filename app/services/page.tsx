import Link from "next/link";
import { sql } from "@/lib/db";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";
import { groupServicesByCategory } from "@/lib/service-categories";
import type { Service } from "@/types/database";

export const dynamic = "force-dynamic";

async function getServices(): Promise<Service[]> {
  try {
    const { rows } = await sql`
      select id, name, description, duration_minutes, price, is_active, created_at
      from services
      where is_active = true
      order by name
    `;
    return (rows || []) as Service[];
  } catch (e) {
    console.error("[ServicesPage] getServices error:", e);
    return [];
  }
}

function ServiceCard({ s }: { s: Service }) {
  return (
    <div className="card group hover:border-white/20 transition-colors">
      <h3 className="font-semibold text-white">{s.name}</h3>
      {s.description && (
        <p className="mt-1 text-sm text-slate-300 line-clamp-2">{s.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {s.duration_minutes} min
          {s.price != null && ` · $${Number(s.price).toFixed(0)}`}
        </span>
        <Link
          href={String(s.id).startsWith("fallback") ? "/book" : `/book?service=${s.id}`}
          className="btn-primary text-sm py-1.5 px-3"
        >
          Book
        </Link>
      </div>
    </div>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  const displayServices = services.length > 0 ? services : FALLBACK_SERVICES;
  const byCategory = groupServicesByCategory(displayServices);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Our Services</h1>
        <p className="mt-2 text-slate-300">
          Choose a service to see availability and book. Grouped by category for easy browsing.
        </p>
      </div>

      {displayServices.length === 0 ? (
        <div className="card max-w-xl mx-auto text-center">
          <p className="text-slate-300">No services listed yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Run <code className="rounded bg-white/10 px-1 py-0.5 text-xs">lib/seed-services.sql</code> in your database to add services.
          </p>
          <Link href="/book" className="mt-4 inline-block btn-secondary">
            Book an appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Array.from(byCategory.entries()).map(([category, list]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-white/10">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            </section>
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
