import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource/limelight/400.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthStatus } from "@/components/AuthStatus";
import { AgeGate } from "@/components/AgeGate";
import { SunMark } from "@/components/Sunburst";

export const metadata: Metadata = {
  title: "The Sunday Morning Cigar Club",
  description: "A members' club for cigar lovers in Las Vegas and beyond. Mockup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <div className="bg-gold px-4 py-1.5 text-center text-sm text-deep">
          Work in progress. Sign-in and the Board are live; meetups, the member directory, prices and the rest are still sample data.
        </div>
        <Nav
          auth={
            <Suspense fallback={<span className="block h-9 w-40" aria-hidden />}>
              <AuthStatus />
            </Suspense>
          }
        />
        <main className="flex-1">{children}</main>
        <footer className="mt-20 bg-deep">
          <div className="pinstripe" />
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-haze sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <SunMark className="mt-1 h-5 w-9 shrink-0" />
              <p>
                <span className="font-display text-base text-sand">The Sunday Morning Cigar Club</span>
                <br />
                Las Vegas, Nevada
              </p>
            </div>
            <p>For adults 21 and over. We don&apos;t sell tobacco; partner retailers do.</p>
            <p>
              Some cigar links are affiliate links. If you buy through them, the club earns a small
              commission at no cost to you.
            </p>
          </div>
        </footer>
        <AgeGate />
      </body>
    </html>
  );
}
