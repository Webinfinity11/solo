"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { LegalDocument } from "@/lib/types";
import type { Localized } from "@/lib/content/types";
import { saveLegal } from "@/app/admin/actions";
import { LangTabs, PageTitle, SaveBar, Section, TextArea, TextInput, move, newId, useSave } from "./ui";
import { cn } from "@/lib/utils";

export function LegalEditor({ initial }: { initial: Localized<LegalDocument[]> }) {
  const [docs, setDocs] = useState(initial);
  const [lang, setLang] = useState<Locale>("ka");
  const [slug, setSlug] = useState(initial.ka[0]?.slug ?? "");
  const { save, pending, status, dirty, markDirty } = useSave();

  const list = docs[lang];
  const index = Math.max(0, list.findIndex((d) => d.slug === slug));
  const doc = list[index];

  function patchDoc(p: Partial<LegalDocument>) {
    setDocs((prev) => ({ ...prev, [lang]: prev[lang].map((d, i) => (i === index ? { ...d, ...p } : d)) }));
    markDirty();
  }
  const sections = doc?.sections ?? [];
  const patchSection = (i: number, p: Partial<LegalDocument["sections"][number]>) => patchDoc({ sections: sections.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  return (
    <>
      <PageTitle
        title="იურიდიული გვერდები"
        description="წესები და პირობები, კონფიდენციალურობა, მიწოდების პოლიტიკა. ფუტერის ბმულების სახელები იცვლება „გვერდების ტექსტებში“ (ფუტერი)."
        actions={<LangTabs value={lang} onChange={setLang} />}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {list.map((d) => (
          <button key={d.slug} type="button" onClick={() => setSlug(d.slug)} className={cn("adm-btn", d.slug === doc?.slug && "adm-btn-primary")}>
            {d.title}
          </button>
        ))}
      </div>

      {doc ? (
        <div className="flex max-w-4xl flex-col gap-4">
          <Section>
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <TextInput label="სათაური" value={doc.title} onChange={(title) => patchDoc({ title })} />
              <TextInput label="ბოლო განახლება" type="date" value={doc.updated} onChange={(updated) => patchDoc({ updated })} />
            </div>
            <p className="mt-2 text-[12px] text-muted">მისამართი: /legal/{doc.slug}</p>
          </Section>

          {sections.map((s, i) => (
            <Section key={s.id}>
              <div className="flex flex-col gap-3">
                <div className="flex items-end gap-2">
                  <TextInput label={`თავი ${i + 1}`} className="flex-1" value={s.title} onChange={(title) => patchSection(i, { title })} />
                  <button type="button" className="adm-btn px-2.5" onClick={() => patchDoc({ sections: move(sections, i, -1) })}>
                    ↑
                  </button>
                  <button type="button" className="adm-btn px-2.5" onClick={() => patchDoc({ sections: move(sections, i, 1) })}>
                    ↓
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger px-2.5"
                    onClick={() => window.confirm("წავშალო ეს თავი?") && patchDoc({ sections: sections.filter((_, j) => j !== i) })}
                  >
                    ✕
                  </button>
                </div>
                <TextArea
                  rows={5}
                  value={s.paragraphs.join("\n\n")}
                  onChange={(v) => patchSection(i, { paragraphs: v.split(/\n\s*\n/) })}
                  hint="აბზაცები გამოყავით ცარიელი ხაზით."
                />
              </div>
            </Section>
          ))}
          <button type="button" className="adm-btn self-start" onClick={() => patchDoc({ sections: [...sections, { id: newId("s"), title: "", paragraphs: [""] }] })}>
            + თავი
          </button>
        </div>
      ) : null}

      <SaveBar
        onSave={() =>
          save(() =>
            // Drop empty paragraphs left by extra blank lines.
            saveLegal(
              Object.fromEntries(
                Object.entries(docs).map(([l, ds]) => [l, ds.map((d) => ({ ...d, sections: d.sections.map((s) => ({ ...s, paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean) })) }))]),
              ),
            ),
          )
        }
        pending={pending}
        status={status}
        dirty={dirty}
      />
    </>
  );
}
