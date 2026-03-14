"use client";

import { useState } from "react";

export function DoctorLocationSetting() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function useCurrentLocation() {
    setStatus("loading");
    setMessage("");
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/doctor/location", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setStatus("error");
            setMessage(data.error || "Failed to save location.");
            return;
          }
          setStatus("success");
          setMessage("Practice location updated. Patients can now find you nearby.");
        } catch {
          setStatus("error");
          setMessage("Network error.");
        }
      },
      () => {
        setStatus("error");
        setMessage("Location access denied.");
      }
    );
  }

  return (
    <section className="card mt-8">
      <h2 className="text-lg font-semibold text-text">Your practice location</h2>
      <p className="mt-1 text-sm text-text-muted">
        Set your location so patients can find you in &quot;Find doctors nearby.&quot;
      </p>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={status === "loading"}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "loading" ? "Getting location…" : "Use my current location"}
      </button>
      {status === "success" && message && (
        <p className="mt-2 text-sm text-green-600">{message}</p>
      )}
      {status === "error" && message && (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      )}
    </section>
  );
}
