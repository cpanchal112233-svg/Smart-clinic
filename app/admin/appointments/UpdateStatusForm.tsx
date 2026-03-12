"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppointmentStatus } from "@/types/database";

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: "booked", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function UpdateStatusForm({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: AppointmentStatus) {
    setLoading(true);
    await fetch(`/api/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => update(e.target.value as AppointmentStatus)}
      disabled={loading}
      className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
