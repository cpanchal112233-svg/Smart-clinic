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
      {/* Overlay so white/light content remains readable over the 3D scene */}
      <div
        className="fixed inset-0 -z-10 bg-slate-900/35 pointer-events-none"
        aria-hidden
      />
    </>
  );
}
