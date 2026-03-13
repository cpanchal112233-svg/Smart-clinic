import type { Service } from "@/types/database";

/** Shown on Home and Services when DB has no services (e.g. before seed-services.sql is run). */
export const FALLBACK_SERVICES: Service[] = [
  { id: "fallback-1", name: "General Checkup", description: "Routine health assessment and preventive care.", duration_minutes: 30, price: 50, is_active: true, created_at: "" },
  { id: "fallback-2", name: "Consultation", description: "One-on-one time with your doctor to discuss concerns.", duration_minutes: 20, price: 75, is_active: true, created_at: "" },
  { id: "fallback-3", name: "Follow-up", description: "Track progress and adjust treatment as needed.", duration_minutes: 15, price: 40, is_active: true, created_at: "" },
];
