"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this appointment?")) return;
    setLoading(true);
    const res = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
