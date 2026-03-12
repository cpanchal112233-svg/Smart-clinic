"use client";

import Link from "next/link";

const gradientId = "logo-grad";
const lineId = "logo-line";
const dotId = "logo-dot";

export function Logo({ animated = true, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-semibold text-text no-underline ${className}`}
      aria-label="SmartClinic – Home"
    >
      <span
        className={`inline-flex shrink-0 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:sm:h-9 [&_svg]:sm:w-9 ${animated ? "logo-root" : ""}`}
        aria-hidden
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5A4" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <path
            d="M24 4c6 0 10 2 14 6 2 2 4 6 4 10 0 8-2 14-6 18s-8 6-16 10c-8-4-12-6-16-10S4 28 4 20c0-4 2-8 4-10 4-4 8-6 14-6z"
            fill={`url(#${gradientId})`}
            opacity={0.14}
          />
          <path
            id={lineId}
            d="M14 24h4l2-6 4 12 2-6h4"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={animated ? 1 : 0}
            className={animated ? "logo-line" : ""}
          />
          <circle
            id={dotId}
            cx="24"
            cy="24"
            r="3"
            fill="#0EA5A4"
            className={animated ? "logo-dot" : ""}
          />
        </svg>
      </span>
      <span className="text-xl text-primary">SmartClinic</span>
    </Link>
  );
}
