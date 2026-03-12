"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function change(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "all") p.delete("status");
    else p.set("status", value);
    router.push(`/admin/appointments?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">Status:</span>
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
