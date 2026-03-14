import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import { GlobalSceneBackground } from "@/components/layout/GlobalSceneBackground";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SmartClinic — Modern healthcare, made easier",
  description:
    "Book appointments, manage visits, and stay connected through one seamless clinic experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen flex flex-col bg-transparent">
        <GlobalSceneBackground />
        <div className="relative z-0 flex min-h-screen flex-col">
          <SessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
