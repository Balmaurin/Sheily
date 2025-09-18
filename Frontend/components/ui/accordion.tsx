"use client";
import * as React from "react";

type Item = { id: string; question: string; answer: string };

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-border bg-card/60">
      {items.map((it) => (
        <div key={it.id}>
          <button
            onClick={() => setOpen((o) => (o === it.id ? null : it.id))}
            className="w-full text-left px-5 py-4 hover:bg-white/[0.03] flex items-center justify-between"
          >
            <span className="font-medium">{it.question}</span>
            <span className="text-white/50">{open === it.id ? "–" : "+"}</span>
          </button>
          {open === it.id && (
            <div className="px-5 pb-5 text-white/70">{it.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
