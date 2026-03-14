"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  fullName: string;
  email: string;
  phone: string;
}

export function ProfileForm({ fullName, email, phone }: ProfileFormProps) {
  const router = useRouter();
  const [full_name, setFullName] = useState(fullName);
  const [phone_val, setPhone] = useState(phone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: full_name, phone: phone_val || null }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setMessage({ type: "err", text: data.error ?? "Update failed" });
      return;
    }
    setMessage({ type: "ok", text: "Profile updated." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === "ok" ? "bg-green-500/20 text-green-200 border border-green-400/30" : "bg-red-500/20 text-red-200 border border-red-400/30"}`}>
          {message.text}
        </div>
      )}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-200">Full name</label>
        <input
          id="full_name"
          type="text"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          className="input-glass mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200">Email</label>
        <p className="mt-1 text-slate-300">{email}</p>
        <p className="text-xs text-slate-400">Email cannot be changed here.</p>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-200">Phone</label>
        <input
          id="phone"
          type="tel"
          value={phone_val}
          onChange={(e) => setPhone(e.target.value)}
          className="input-glass mt-1"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
