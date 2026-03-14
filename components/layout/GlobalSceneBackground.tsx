"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("@/components/experience/Scene3D"), {
  ssr: false,
});

/** Fixed 3D background + overlay so page content stays readable. Rendered on every page via root layout. */
export function GlobalSceneBackground() {
  return (
    <>
      <Scene3D />
      {/* Light overlay so 3D stays visible and text remains readable */}
      <div
        className="fixed inset-0 -z-10 bg-slate-900/25 pointer-events-none"
        aria-hidden
      />
    </>
  );
}
