"use client";

/**
 * Premium soft background for login/signup. Matches hero feel with stronger overlay for form readability.
 * No 3D/Spline here — calm and premium only.
 */
export default function AuthPageBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(14,165,164,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(37,99,235,0.12), transparent 28%), linear-gradient(to bottom, #f8fafc, #ffffff)",
        }}
      />
      <div className="absolute inset-0 bg-white/82" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(14,165,164,0.08), transparent 35%), radial-gradient(circle at bottom right, rgba(37,99,235,0.06), transparent 30%)",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}
