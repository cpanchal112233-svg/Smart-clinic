"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("@/components/experience/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-[#020617] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function ExperiencePage() {
  return (
    <main className="scroll-container relative">
      <Scene3D />

      <section className="h-screen flex items-center px-6 sm:px-10">
        <h1 className="text-5xl sm:text-6xl font-bold text-white max-w-md">
          Precision Diagnostics.
        </h1>
      </section>

      <section className="h-screen flex items-center justify-end px-6 sm:px-10">
        <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl text-white max-w-sm">
          <h2 className="text-2xl font-bold">Comprehensive Scan</h2>
          <p className="opacity-70 mt-2">
            Our AI analyzes patient vitals in real-time.
          </p>
        </div>
      </section>

      <section className="h-screen flex items-center px-6 sm:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <h2 className="text-4xl font-bold text-white">Your Health, Digitized.</h2>
          <Link
            href="/book"
            className="rounded-lg bg-cyan-500 px-6 py-3 text-white font-medium hover:bg-cyan-400 transition-colors"
          >
            Book a visit
          </Link>
        </div>
      </section>
    </main>
  );
}
