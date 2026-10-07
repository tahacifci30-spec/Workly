"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Actief wanneer het pad met `href` begint, behalve als het met `except` begint. */
export function NavLink({
  href,
  except,
  children,
}: {
  href: string;
  except?: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(href) && !except?.some((e) => pathname.startsWith(e));
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
        active ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-slate-100 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
