"use client";

import Link from "next/link";
import { useId } from "react";

export function Logo({
  animated = true,
  showWordmark = true,
  className = "",
}: {
  animated?: boolean;
  showWordmark?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const prismBlueId = `logo-prism-blue-${id}`;
  const prismIndigoId = `logo-prism-indigo-${id}`;
  const prismCyanId = `logo-prism-cyan-${id}`;
  const softGlowId = `logo-soft-glow-${id}`;

  return (
    <Link
      href="/"
      className={`inline-flex items-center font-semibold text-text no-underline ${showWordmark ? "gap-2.5" : ""} ${className}`}
      aria-label="SmartClinic – Home"
    >
      <span
        className={`inline-flex shrink-0 ${animated ? "logo-root" : ""}`}
        style={{ width: 44, height: 44 }}
        aria-hidden
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-svg block h-full w-full"
          width="44"
          height="44"
          role="img"
          aria-hidden
        >
          <defs>
            <linearGradient id={prismBlueId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id={prismIndigoId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id={prismCyanId} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <filter id={softGlowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path d="M256 40L442 148V364L256 472L70 364V148L256 40Z" fill="#F8FAFC" fillOpacity="0.05" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="216" y="112" width="80" height="288" rx="12" fill={`url(#${prismBlueId})`} fillOpacity="0.9" />
          <rect x="112" y="216" width="288" height="80" rx="12" fill={`url(#${prismIndigoId})`} fillOpacity="0.8" />
          <rect x="216" y="216" width="80" height="80" rx="8" fill={`url(#${prismCyanId})`} filter={`url(#${softGlowId})`} className={animated ? "logo-core" : ""} />
          <circle cx="256" cy="256" r="210" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 12" />
          <circle cx="256" cy="256" r="240" stroke="#94A3B8" strokeWidth="0.5" />
          <circle cx="442" cy="148" r="6" fill="#22D3EE" />
          <circle cx="70" cy="364" r="6" fill="#6366F1" />
          <circle cx="256" cy="40" r="4" fill="#2563EB" />
        </svg>
      </span>
      {showWordmark && <span className="text-xl tracking-tight text-[#2563EB]">SmartClinic</span>}
    </Link>
  );
}
