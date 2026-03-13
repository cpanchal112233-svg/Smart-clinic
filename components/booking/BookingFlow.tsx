"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Service } from "@/types/database";
import type { Doctor } from "@/types/database";

type DoctorWithName = Doctor & { full_name: string };

const STEPS = [
  "Choose service",
  "Choose doctor",
  "Select date",
  "Select time",
  "Your details",
  "Confirm",
];

interface BookingFlowProps {
  services: Service[];
  doctors: DoctorWithName[];
}

export function BookingFlow({ services, doctors }: BookingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(
    () => searchParams.get("service") || null
  );
  const [doctorId, setDoctorId] = useState<string | null>(
    () => searchParams.get("doctor") || null
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; email: string; phone: string | null } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const user = session?.user;
  const isGuest = !user;

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then(setProfile);
  }, [user?.id]);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/slots?doctor_id=${doctorId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const handleConfirm = async () => {
    if (!serviceId || !doctorId || !date || !time) return;
    if (user) {
      if (!user.id) return;
    } else {
      if (!guestName.trim() || !guestEmail.trim()) {
        alert("Please enter your name and email.");
        return;
      }
    }
    setSubmitting(true);
    const body: Record<string, unknown> = {
      service_id: serviceId,
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time,
      notes: notes || null,
    };
    if (isGuest) {
      body.guest_name = guestName.trim();
      body.guest_email = guestEmail.trim();
      body.guest_phone = guestPhone.trim() || null;
    }
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      alert(data.error ?? "Booking failed");
      return;
    }
    router.push(`/book/confirmation?id=${data.id}`);
    router.refresh();
  };

  const nextDisabled =
    (step === 0 && !serviceId) ||
    (step === 1 && !doctorId) ||
    (step === 2 && !date) ||
    (step === 3 && !time) ||
    (step === 4 && isGuest && (!guestName.trim() || !guestEmail.trim()));

  const dates = (() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  })();

  return (
    <div className="mt-8">
      {isGuest && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center text-sm text-text">
          <strong>Booking as guest</strong> — No account needed. Choose your service and time; we&apos;ll ask for your name and email before confirming.
        </div>
      )}
      <div className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              i === step
                ? "bg-primary text-white"
                : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-slate-100 text-text-muted"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div>
            <h2 className="font-semibold text-text">Select a service</h2>
            {services.length === 0 ? (
              <p className="mt-4 text-text-muted">
                No services in the database yet. Run <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/seed-services.sql</code> in Neon SQL Editor to add services, or contact the clinic.
              </p>
            ) : (
            <div className="mt-4 space-y-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={`block w-full rounded-lg border p-4 text-left transition ${
                    serviceId === s.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-2 text-sm text-text-muted">
                    {s.duration_minutes} min
                    {s.price != null && ` · $${Number(s.price).toFixed(0)}`}
                  </span>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-semibold text-text">Select a doctor</h2>
            {doctors.length === 0 ? (
              <p className="mt-4 text-text-muted">
                No doctors available yet. Add doctors in the database (see deployment guide) to enable booking.
              </p>
            ) : (
            <div className="mt-4 space-y-2">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDoctorId(d.id)}
                  className={`block w-full rounded-lg border p-4 text-left transition ${
                    doctorId === d.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium">{d.full_name ?? "Doctor"}</span>
                  <span className="ml-2 text-sm text-primary">{d.specialty}</span>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-semibold text-text">Select date</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`rounded-lg border py-2 text-sm ${
                    date === d ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}
                >
                  {new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-semibold text-text">Select time</h2>
            {loadingSlots ? (
              <p className="mt-4 text-text-muted">Loading slots…</p>
            ) : slots.length === 0 ? (
              <p className="mt-4 text-text-muted">
                {date ? "No available slots for this date." : "Select a date first."}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`rounded-lg border py-2 text-sm ${
                      time === t ? "border-primary bg-primary/5" : "border-slate-200"
                    }`}
                  >
                    {t.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-semibold text-text">Your details</h2>
            {user ? (
              <>
                <p className="mt-2 text-sm text-text-muted">
                  We&apos;ll use your profile. Add any notes for the doctor below.
                </p>
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="font-medium">{profile?.full_name ?? user?.name}</p>
                  <p className="text-sm text-text-muted">{profile?.email ?? user?.email}</p>
                  {profile?.phone && (
                    <p className="text-sm text-text-muted">{profile.phone}</p>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  <Link href="/patient/profile" className="text-primary hover:underline">
                    Update profile
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-text-muted">
                  Enter your contact details. No account needed.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="guest-name" className="block text-sm font-medium text-text">Full name *</label>
                    <input
                      id="guest-name"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-email" className="block text-sm font-medium text-text">Email *</label>
                    <input
                      id="guest-email"
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-phone" className="block text-sm font-medium text-text">Phone (optional)</label>
                    <input
                      id="guest-phone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-text">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Any symptoms or questions for the doctor?"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-semibold text-text">Confirm booking</h2>
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
              {isGuest && (
                <p><span className="text-text-muted">Name:</span> {guestName}</p>
              )}
              {isGuest && (
                <p><span className="text-text-muted">Email:</span> {guestEmail}</p>
              )}
              <p><span className="text-text-muted">Service:</span> {selectedService?.name}</p>
              <p><span className="text-text-muted">Doctor:</span> {selectedDoctor?.full_name} ({selectedDoctor?.specialty})</p>
              <p><span className="text-text-muted">Date:</span> {date && new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              <p><span className="text-text-muted">Time:</span> {time?.slice(0, 5)}</p>
              {notes && <p><span className="text-text-muted">Notes:</span> {notes}</p>}
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="mt-6 btn-primary w-full"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={nextDisabled}
              className="btn-primary disabled:opacity-50"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
