"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type NearbyDoctor = {
  id: string;
  full_name: string;
  specialty: string;
  bio: string | null;
  avatar_url: string | null;
  distance_km: number;
};

export function FindDoctorsNearby({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "error" | "success">("idle");
  const [doctors, setDoctors] = useState<NearbyDoctor[]>([]);
  const [message, setMessage] = useState<string>("");

  async function handleFindNearby() {
    setStatus("loading");
    setMessage("");
    setDoctors([]);

    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `/api/doctors/nearby?lat=${latitude}&lng=${longitude}&radius_km=50`
          );
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setStatus("error");
            setMessage(data.error || "Failed to load nearby doctors.");
            return;
          }
          const data = await res.json();
          const list = data.doctors ?? [];
          setDoctors(list);
          setStatus(list.length ? "success" : "success");
          if (list.length === 0) setMessage("No doctors with location set within 50 km.");
        } catch {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      },
      () => {
        setStatus("denied");
        setMessage("Location access denied. Enable location to find doctors nearby.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className}`}>
      <h2 className="text-lg font-semibold text-white">Find doctors nearby</h2>
      <p className="mt-1 text-sm text-slate-300">
        Use your current location to see available doctors near you for quick booking.
      </p>
      <button
        type="button"
        onClick={handleFindNearby}
        disabled={status === "loading"}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "loading" ? "Finding…" : "Use my location"}
      </button>

      {(status === "denied" || status === "error") && message && (
        <p className="mt-3 text-sm text-amber-400">{message}</p>
      )}

      {status === "success" && doctors.length === 0 && message && (
        <p className="mt-3 text-sm text-slate-400">{message}</p>
      )}

      {status === "success" && doctors.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-300">
            {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} nearby (within 50 km)
          </p>
          <ul className="space-y-2">
            {doctors.map((d) => (
              <li key={d.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10 border border-white/10">
                    {d.avatar_url ? (
                      <Image src={d.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                        {d.full_name?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{d.full_name}</p>
                    <p className="text-sm text-primary">{d.specialty}</p>
                    <p className="text-xs text-slate-400">{d.distance_km} km away</p>
                  </div>
                </div>
                <Link
                  href={`/book?doctor=${d.id}`}
                  className="btn-primary text-sm shrink-0"
                >
                  Book
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
