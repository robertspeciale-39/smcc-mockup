"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SunMark } from "./Sunburst";

const links = [
  { href: "/", label: "Lobby" },
  { href: "/board", label: "The Board" },
  { href: "/meetups", label: "Meetups" },
  { href: "/finder", label: "Cigar Finder" },
  { href: "/podcast", label: "Podcast" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gold/30 bg-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <SunMark className="h-6 w-11" />
          <span className="font-display text-lg leading-tight text-sand">
            Sunday Morning
            <span className="block text-xs text-gold">Cigar Club</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={`rounded px-3 py-2 text-[0.95rem] transition-colors hover:text-flamingo ${
                path === l.href ? "text-flamingo" : "text-sand/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-2">
          <Link href="/profile" className="hidden h-9 w-9 place-items-center rounded-full border border-gold/60 text-sm text-gold sm:grid" aria-label="Your profile">
            RS
          </Link>
          <Link href="/membership" className="whitespace-nowrap rounded-full bg-flamingo px-4 py-2 text-sm font-medium text-deep hover:bg-sand">
            Join the club
          </Link>
          <button
            className="rounded border border-gold/40 px-3 py-2 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-gold/20 px-4 pb-4 lg:hidden" aria-label="Main">
          {[...links, { href: "/profile", label: "My profile" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-gold/10 py-3 ${path === l.href ? "text-flamingo" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
