"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QueueStatus } from "@/types/database";

export function QueueActions({
  queueEntryId,
  status,
}: {
  queueEntryId: string;
  appointmentId?: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(newStatus: QueueStatus) {
    setLoading(true);
    const res = await fetch("/api/admin/queue/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueEntryId, status: newStatus }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex gap-1">
      {status === "waiting" && (
        <button
          type="button"
          onClick={() => setStatus("in_progress")}
          disabled={loading}
          className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
        >
          In progress
        </button>
      )}
      {(status === "waiting" || status === "in_progress") && (
        <button
          type="button"
          onClick={() => setStatus("completed")}
          disabled={loading}
          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200 disabled:opacity-50"
        >
          Done
        </button>
      )}
    </div>
  );
}
