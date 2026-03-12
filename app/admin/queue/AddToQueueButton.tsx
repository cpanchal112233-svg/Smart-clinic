"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToQueueButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/admin/queue/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Failed to add to queue.");
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading}
      className="btn-primary text-sm disabled:opacity-50"
    >
      {loading ? "Adding…" : "Check in / Add to queue"}
    </button>
  );
}
