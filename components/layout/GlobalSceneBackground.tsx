"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Scene3D = dynamic(() => import("@/components/experience/Scene3D"), {
  ssr: false,
});

/** Fixed 3D background + overlay so page content stays readable. Hidden on /diagnostics (uses its own scene). */
export function GlobalSceneBackground() {
  const pathname = usePathname();
  if (pathname === "/diagnostics") return null;

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
