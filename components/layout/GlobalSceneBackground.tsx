"use client";

import dynamic from "next/dynamic";

const DiagnosticViewBackground = dynamic(
  () => import("@/components/experience/DiagnosticViewBackground"),
  { ssr: false }
);

/** Fixed 3D diagnostic view (doctor, patient, scanner) + overlay. Rendered on every page via root layout. */
export function GlobalSceneBackground() {
  return (
    <>
      <DiagnosticViewBackground />
      {/* Light overlay so 3D stays visible and text remains readable */}
      <div
        className="fixed inset-0 -z-10 bg-slate-900/25 pointer-events-none"
        aria-hidden
      />
    </>
  );
}
