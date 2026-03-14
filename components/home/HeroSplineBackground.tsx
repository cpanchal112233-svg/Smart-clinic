"use client";

type HeroSplineBackgroundProps = {
  /** Set NEXT_PUBLIC_SPLINE_HERO_SCENE to your Spline scene URL when the package works with your Next.js version. */
  scene?: string;
};

export default function HeroSplineBackground({ scene }: HeroSplineBackgroundProps) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at top, rgba(14,165,164,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(37,99,235,0.12), transparent 28%), linear-gradient(to bottom, #f8fafc, #ffffff)",
        }}
      />
      {/* Soft overlays for readability */}
      <div className="absolute inset-0 bg-white/72" />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: "radial-gradient(circle at top, rgba(14,165,164,0.10), transparent 35%), radial-gradient(circle at bottom right, rgba(37,99,235,0.08), transparent 30%)",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
