"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["#hoe-het-werkt", "Hoe het werkt"],
  ["#dashboard", "Dashboard"],
  ["#besparing", "Besparing"],
  ["#prijzen", "Prijzen"],
  ["#faq", "Veelgestelde vragen"],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white"
      >
        <span className="sr-only">{open ? "Menu sluiten" : "Menu openen"}</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobiel menu"
          className="absolute inset-x-0 top-16 border-b border-line bg-white px-4 pb-4 shadow-lg"
        >
          <ul className="divide-y divide-line">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium">
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="block py-3 text-base font-medium text-muted">
                Inloggen
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
