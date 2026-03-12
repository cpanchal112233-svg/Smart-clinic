"use client";

import Link from "next/link";

const gradId = "logo-grad";
const glowId = "logo-glow";
const filterId = "logo-glow-filter";

export function Logo({ animated = true, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-semibold text-text no-underline ${className}`}
      aria-label="SmartClinic – Home"
    >
      <span
        className={`inline-flex shrink-0 [&_svg]:h-9 [&_svg]:w-9 [&_svg]:sm:h-10 [&_svg]:sm:w-10 ${animated ? "logo-root" : ""}`}
        aria-hidden
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="logo-svg">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <filter id={filterId}>
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Orbital ring - draws in */}
          <circle
            className={animated ? "logo-ring" : ""}
            cx="24"
            cy="24"
            r="20"
            stroke={`url(#${gradId})`}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={animated ? 1 : 0}
          />
          {/* Flowing pulse line - draws in after ring */}
          <path
            className={animated ? "logo-pulse-line" : ""}
            d="M8 24c0 0 4-10 8-4s4 14 8 8 8-10 8-4"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={animated ? 1 : 0}
          />
          {/* Core orb - glows and scales */}
          <circle
            className={animated ? "logo-core" : ""}
            cx="24"
            cy="24"
            r="4"
            fill={`url(#${glowId})`}
            filter={`url(#${filterId})`}
          />
        </svg>
      </span>
      <span className="text-xl tracking-tight text-[#2563EB]">SmartClinic</span>
    </Link>
  );
}
