"use client";

import { useState } from "react";
import Link from "next/link";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import type { Localized, TextOverrides } from "@/lib/content/types";
import { saveTexts } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { PageTitle, SaveBar, useSave } from "./ui";

type Value = string | string[];
export type TextRow = { path: string; list: boolean; defaults: Localized<Value>; values: Localized<Value> };

const toText = (v: Value) => (Array.isArray(v) ? v.join("\n") : v);
const same = (a: Value, b: Value) => toText(a) === toText(b);

export function TextsEditor({ sections, section, rows }: { sections: { key: string; label: string; changed: boolean }[]; section: string; rows: TextRow[] }) {
  const [values, setValues] = useState(() => rows.map((r) => r.values));
  const { save, pending, status, dirty, markDirty } = useSave();

  function set(i: number, lang: Locale, text: string) {
    const value = rows[i].list ? text.split("\n") : text;
    setValues((prev) => prev.map((v, j) => (j === i ? { ...v, [lang]: value } : v)));
    markDirty();
  }

  function onSave() {
    const payload = Object.fromEntries(locales.map((l) => [l, {} as TextOverrides])) as Localized<TextOverrides>;
    rows.forEach((row, i) => {
      for (const l of locales) {
        const raw = values[i][l];
        const value = Array.isArray(raw) ? raw.map((x) => x.trim()).filter(Boolean) : raw;
        // Only differences from the built-in text are stored, so later code updates still reach untouched fields.
        if (!same(value, row.defaults[l])) payload[l][row.path] = value;
      }
    });
    save(() => saveTexts(section, payload));
  }

  return (
    <>
      <PageTitle title="გვერდების ტექსტები" description="ყველა ტექსტი საიტზე, განყოფილებების მიხედვით. ცარიელი ველი საიტზე ცარიელად გამოჩნდება — ძველის დასაბრუნებლად დააჭირეთ „საწყისი“." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {sections.map((s) => (
            <Link
              key={s.key}
              href={`/admin/texts?s=${s.key}`}
              onClick={(e) => {
                if (dirty && !window.confirm("შეუნახავი ცვლილებები დაიკარგება. გავაგრძელო?")) e.preventDefault();
              }}
              className={cn("px-3 py-1.5 text-[13px]", s.key === section ? "bg-navy font-bold text-white" : "hover:bg-white")}
            >
              {s.label}
              {s.changed ? <span className="ml-1.5 text-blue" title="შეცვლილია">●</span> : null}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-3">
          {rows.map((row, i) => {
            const rowsCount = row.list ? Math.max(3, toText(values[i].ka).split("\n").length) : Math.min(8, Math.ceil(toText(row.defaults.ka).length / 70) + 1);
            return (
              <div key={row.path} className="adm-card p-4">
                <p className="mb-3 font-mono text-[12px] text-eyebrow">
                  {row.path.slice(section.length + 1) || section}
                  {row.list ? <span className="ml-2 font-sans text-muted">· სია: ერთი ხაზი = ერთი ელემენტი</span> : null}
                </p>
                <div className="grid gap-3 xl:grid-cols-3">
                  {locales.map((l) => {
                    const changed = !same(values[i][l], row.defaults[l]);
                    return (
                      <div key={l} className="min-w-0">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="adm-label mb-0">{localeMeta[l].label}</span>
                          {changed ? (
                            <button type="button" className="text-[11px] font-bold text-eyebrow hover:underline" onClick={() => set(i, l, toText(row.defaults[l]))}>
                              ↺ საწყისი
                            </button>
                          ) : null}
                        </div>
                        <textarea
                          className={cn("adm-input min-h-0", changed && "border-blue bg-[#f3f9ff]")}
                          rows={rowsCount}
                          value={toText(values[i][l])}
                          onChange={(e) => set(i, l, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SaveBar onSave={onSave} pending={pending} status={status} dirty={dirty} />
    </>
  );
}
