import { logout } from "@/app/actions";
import type { Session } from "@/lib/types";
import { NavLink } from "./NavLink";
import { Logo } from "./ui";

export function AppShell({
  session,
  children,
  wide = false,
}: {
  session: Session;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const owner = session.role === "owner";
  const home = owner ? "/dashboard" : "/technician";
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Naar hoofdinhoud
      </a>
      <header className="border-b border-line bg-surface print:hidden">
        <div className={`mx-auto flex h-14 items-center justify-between gap-2 px-4 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="flex items-center gap-3 sm:gap-5">
            <Logo href={home} />
            <nav aria-label="Hoofdnavigatie" className="flex items-center gap-1">
              {owner ? (
                <>
                  <NavLink href="/dashboard" except={["/dashboard/settings", "/dashboard/results"]}>
                    Aanvragen
                  </NavLink>
                  <NavLink href="/dashboard/results">Resultaten</NavLink>
                  <NavLink href="/dashboard/settings">
                    Instellingen
                  </NavLink>
                </>
              ) : (
                <NavLink href="/technician">
                  Mijn bezoeken
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted md:inline">
              {session.name} · {owner ? "Installateur" : "Technieker"}
            </span>
            <form action={logout}>
              <button type="submit" className="rounded-md px-2.5 py-1.5 font-medium text-muted hover:bg-slate-100 hover:text-foreground">
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className={`mx-auto w-full flex-1 px-4 py-8 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>
    </>
  );
}
