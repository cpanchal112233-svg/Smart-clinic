"use client";

import { useState } from "react";
type AppRow = {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  specialty: string;
  document_urls: string[];
  status: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export function DoctorApplicationsList({ applications }: { applications: AppRow[] }) {
  const [list, setList] = useState(applications);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/doctor-applications/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setList((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Approval failed");
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setRejectingId(id);
    try {
      const res = await fetch(`/api/admin/doctor-applications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || null }),
      });
      if (res.ok) {
        setList((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "rejected", rejection_reason: reason || null } : a
          )
        );
        setRejectReason("");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Rejection failed");
      }
    } finally {
      setRejectingId(null);
    }
  };

  const pending = list.filter((a) => a.status === "pending");
  const processed = list.filter((a) => a.status !== "pending");

  return (
    <div className="mt-8 space-y-8">
      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((a) => (
              <div key={a.id} className="card flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{a.full_name}</p>
                  <p className="text-sm text-slate-400">{a.email}</p>
                  <p className="text-sm text-primary mt-1">{a.specialty}</p>
                  {a.document_urls?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 uppercase">Documents</p>
                      <ul className="mt-1 space-y-1">
                        {a.document_urls.map((url, i) => (
                          <li key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              Link {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Applied {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => handleApprove(a.id)}
                    disabled={!!approvingId}
                    className="btn-primary text-sm"
                  >
                    {approvingId === a.id ? "Approving…" : "Approve"}
                  </button>
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    className="input-glass text-sm w-48"
                    value={rejectingId === a.id ? rejectReason : ""}
                    onChange={(e) => setRejectReason(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && rejectingId === a.id) {
                        handleReject(a.id, rejectReason);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleReject(a.id, rejectReason)}
                    disabled={!!rejectingId}
                    className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/20"
                  >
                    {rejectingId === a.id ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {processed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Processed</h2>
          <div className="space-y-2">
            {processed.map((a) => (
              <div
                key={a.id}
                className="card flex flex-wrap items-center justify-between gap-2 opacity-80"
              >
                <div>
                  <span className="font-medium text-white">{a.full_name}</span>
                  <span className="text-slate-400 ml-2">({a.email})</span>
                  <span className="ml-2 text-primary text-sm">{a.specialty}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      a.status === "approved"
                        ? "bg-green-500/20 text-green-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {a.status}
                  </span>
                  {a.rejection_reason && (
                    <p className="text-xs text-slate-500 mt-1">Reason: {a.rejection_reason}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {a.reviewed_at
                    ? `Reviewed ${new Date(a.reviewed_at).toLocaleString()}`
                    : new Date(a.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {list.length === 0 && (
        <div className="card text-center text-slate-400 py-12">
          No doctor applications yet. Applicants will appear here when they sign up via Apply as
          doctor.
        </div>
      )}
    </div>
  );
}
