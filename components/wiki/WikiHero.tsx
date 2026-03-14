"use client";

import { useMemo, useState } from "react";

const QUICK_INTENTS = ["Bat dau", "Dang bai", "Bao mat", "Quy tac", "FAQ", "Lien he"];

export default function WikiHero() {
  const [query, setQuery] = useState("");

  const statusText = useMemo(() => {
    const value = query.trim();
    if (!value) {
      return "Nhap tu khoa de tim bai viet phu hop.";
    }

    return `Dang tim voi tu khoa: ${value}`;
  }, [query]);

  return (
    <section className="border-b border-border bg-paper px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Wiki Dong Ngon</p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.15] text-ink md:text-5xl">Kho tri thuc cho nguoi viet</h1>
        <p className="mt-3 max-w-2xl text-base leading-[1.75] text-muted md:text-lg">Bat dau tu chu de ban can, hoac tim theo tu khoa.</p>

        <div className="mt-6">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="5.5" />
                <path d="M13.5 13.5L17 17" strokeLinecap="round" />
              </svg>
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tim theo chu de, tieu de, tu khoa..."
              aria-label="Tim kiem bai viet wiki"
              className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-12 text-base text-ink placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />

            {query.trim() ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-2 my-1.5 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
              >
                Xoa
              </button>
            ) : null}
          </div>

          <p aria-live="polite" className="mt-2 text-sm leading-6 text-muted">
            {statusText}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {QUICK_INTENTS.map((intent) => (
            <button
              key={intent}
              type="button"
              className="rounded-full bg-accent-soft px-3 py-1.5 text-sm text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
            >
              {intent}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}