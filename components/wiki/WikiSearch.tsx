"use client";

import { useState } from "react";

export default function WikiSearch() {
  const [query, setQuery] = useState("");

  return (
    <section className="rounded-2xl border border-border bg-paper p-4" aria-label="Tim kiem wiki (du phong)">
      <label htmlFor="wiki-search-legacy" className="mb-2 block text-sm font-medium text-ink">
        Tim kiem wiki
      </label>
      <input
        id="wiki-search-legacy"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Nhap tu khoa..."
        aria-label="Tim kiem bai viet wiki"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />
    </section>
  );
}