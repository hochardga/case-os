import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";

type AppShellProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
};

export function AppShell({ children, isAuthenticated = false }: AppShellProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    ...(isAuthenticated
      ? []
      : [
          { href: "/apply", label: "Apply" },
          { href: "/login", label: "Log In" }
        ]),
    { href: "/archive", label: "Archive Access" }
  ];

  return (
    <div className="min-h-screen text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Ashfall Investigative Collective
            </p>
            <Link
              className="mt-1 inline-block text-2xl font-semibold text-slate-50"
              href="/"
            >
              Ashfall Case Library
            </Link>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="rounded-md border border-slate-700 px-3 py-1.5 hover:border-slate-500 hover:text-slate-100"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton isAuthenticated={isAuthenticated} />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-4 text-xs text-slate-400">
          Ashfall Case Library · Phase 1 Foundation Build
        </div>
      </footer>
    </div>
  );
}
