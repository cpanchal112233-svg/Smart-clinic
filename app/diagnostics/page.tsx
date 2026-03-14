"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const DiagnosticsView = dynamic(
  () => import("@/components/diagnostics/DiagnosticsView"),
  { ssr: false }
);

export default function DiagnosticsPage() {
  return (
    <div className="relative min-h-screen">
      <DiagnosticsView />

      {/* UI Overlay - matches your HTML */}
      <div className="fixed inset-0 z-10 flex flex-col justify-between p-6 sm:p-10 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse-slow" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-emerald-500 tracking-widest uppercase font-bold">
                Live Diagnostic View
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                SYSTEM_ID: SC-992-ALPHA
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-cyan-400/60 leading-tight hidden sm:block">
            FRAME_RATE: 60FPS
            <br />
            LATENCY: 12MS
            <br />
            ENCRYPTION: AES-256
          </div>
        </div>

        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter">
            Precision <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Diagnostics.
            </span>
          </h1>
          <p className="text-slate-400 mt-4 text-sm sm:text-base max-w-sm">
            Real-time 3D patient visualization and medical analysis. Scroll to
            explore the future of healthcare.
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-white text-xs max-w-[200px]">
            <p className="opacity-60 mb-2 uppercase tracking-tighter font-bold">
              AI Summary
            </p>
            <p>
              Patient vitals are stable. Scan is 84% complete. No anomalies
              detected in current skeletal alignment.
            </p>
          </div>
          <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" />
            <span className="text-[8px] text-cyan-400 font-bold uppercase">
              Scanning
            </span>
          </div>
        </div>
      </div>

      {/* Scroll spacer so scroll-driven camera works */}
      <div className="relative z-0 h-[300vh]" />

      {/* Optional: CTA at bottom of scroll */}
      <div className="fixed bottom-6 left-6 right-6 z-20 pointer-events-auto sm:left-auto sm:right-10 sm:bottom-10">
        <Link
          href="/book"
          className="inline-flex items-center rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-400"
        >
          Book appointment
        </Link>
      </div>
    </div>
  );
}
