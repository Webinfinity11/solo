"use client";

import { useState } from "react";
import Link from "next/link";
import { locales, localeMeta } from "@/i18n/config";
import type { SiteSettings } from "@/lib/content/types";
import { saveSettings } from "@/app/admin/actions";
import { PageTitle, SaveBar, Section, TextInput, move, useSave } from "./ui";

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const { save, pending, status, dirty, markDirty } = useSave();

  function update(patch: Partial<SiteSettings>) {
    setS((prev) => ({ ...prev, ...patch }));
    markDirty();
  }
  const setSocial = (i: number, patch: Partial<SiteSettings["social"][number]>) => update({ social: s.social.map((x, j) => (j === i ? { ...x, ...patch } : x)) });

  return (
    <>
      <PageTitle
        title="კონტაქტი და ფუტერი"
        description="ეს მონაცემები ჩანს ფუტერში და კონტაქტის გვერდზე. ფუტერის ტექსტები (სლოგანი, გაფრთხილება და ა.შ.) იცვლება „გვერდების ტექსტებში“."
        actions={
          <Link href="/admin/texts?s=footer" className="adm-btn">
            ფუტერის ტექსტები →
          </Link>
        }
      />
      <div className="flex max-w-3xl flex-col gap-5">
        <Section title="კონტაქტი">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="ელ-ფოსტა" type="email" value={s.email} onChange={(email) => update({ email })} />
            <TextInput label="ტელეფონი" value={s.phone} onChange={(phone) => update({ phone })} hint="ცარიელი — არ გამოჩნდება" />
            <TextInput label="WhatsApp ნომერი" value={s.whatsapp} onChange={(whatsapp) => update({ whatsapp })} hint="საერთაშორისო ფორმატით: +995 5XX XX XX XX · გამოიყენება მთავარი გვერდის ღილაკზე" />
          </div>
        </Section>

        <Section title="სამუშაო საათები">
          <div className="grid gap-4 sm:grid-cols-3">
            {locales.map((l) => (
              <TextInput key={l} label={localeMeta[l].label} value={s.hours[l]} onChange={(v) => update({ hours: { ...s.hours, [l]: v } })} />
            ))}
          </div>
        </Section>

        <Section
          title="სოციალური ქსელები"
          actions={
            <button type="button" className="adm-btn" onClick={() => update({ social: [...s.social, { label: "", href: "https://" }] })}>
              + ბმული
            </button>
          }
        >
          <div className="flex flex-col gap-3">
            {s.social.map((link, i) => (
              <div key={i} className="grid items-end gap-3 sm:grid-cols-[180px_1fr_auto]">
                <TextInput label="სახელი" value={link.label} onChange={(label) => setSocial(i, { label })} />
                <TextInput label="ბმული" value={link.href} onChange={(href) => setSocial(i, { href })} />
                <div className="flex gap-1.5">
                  <button type="button" className="adm-btn px-2.5" onClick={() => update({ social: move(s.social, i, -1) })}>
                    ↑
                  </button>
                  <button type="button" className="adm-btn adm-btn-danger px-2.5" onClick={() => update({ social: s.social.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <SaveBar onSave={() => save(() => saveSettings(s))} pending={pending} status={status} dirty={dirty} />
    </>
  );
}
