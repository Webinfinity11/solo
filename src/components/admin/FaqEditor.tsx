"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { FaqDocument, Localized } from "@/lib/content/types";
import { saveFaq } from "@/app/admin/actions";
import { Checkbox, LangTabs, PageTitle, SaveBar, Section, Select, TextArea, TextInput, move, useSave } from "./ui";

export function FaqEditor({ initial }: { initial: Localized<FaqDocument> }) {
  const [docs, setDocs] = useState(initial);
  const [lang, setLang] = useState<Locale>("ka");
  const { save, pending, status, dirty, markDirty } = useSave();
  const doc = docs[lang];

  function change(next: FaqDocument) {
    setDocs((prev) => ({ ...prev, [lang]: next }));
    markDirty();
  }
  type Item = FaqDocument["items"][number];
  const patchItem = (i: number, p: Partial<Item>) => change({ ...doc, items: doc.items.map((it, j) => (j === i ? { ...it, ...p } : it)) });
  const groupOptions = Object.entries(doc.groups).map(([value, label]) => ({ value, label }));

  return (
    <>
      <PageTitle
        title="FAQ"
        description="ხშირად დასმული კითხვები. „მთავარზე“ მონიშნული კითხვები ჩანს მთავარი გვერდის FAQ ბლოკში."
        actions={<LangTabs value={lang} onChange={setLang} />}
      />

      <Section title="ჯგუფები" className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(doc.groups).map(([key, label]) => (
            <TextInput key={key} label={key} value={label} onChange={(v) => change({ ...doc, groups: { ...doc.groups, [key]: v } })} />
          ))}
        </div>
      </Section>

      <div className="flex flex-col gap-3">
        {doc.items.map((item, i) => (
          <Section key={i}>
            <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
              <TextInput label="კითხვა" value={item.question} onChange={(question) => patchItem(i, { question })} />
              <Select label="ჯგუფი" value={item.group} onChange={(group) => patchItem(i, { group })} options={groupOptions} />
              <div className="flex items-end gap-1.5">
                <button type="button" className="adm-btn px-2.5" onClick={() => change({ ...doc, items: move(doc.items, i, -1) })}>
                  ↑
                </button>
                <button type="button" className="adm-btn px-2.5" onClick={() => change({ ...doc, items: move(doc.items, i, 1) })}>
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger px-2.5"
                  onClick={() => window.confirm("წავშალო ეს კითხვა?") && change({ ...doc, items: doc.items.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
              <TextArea label="პასუხი" rows={3} className="md:col-span-2" value={item.answer} onChange={(answer) => patchItem(i, { answer })} />
              <div className="flex items-end pb-2">
                <Checkbox label="მთავარზე" checked={Boolean(item.home)} onChange={(home) => patchItem(i, { home })} />
              </div>
            </div>
          </Section>
        ))}
        <button
          type="button"
          className="adm-btn self-start"
          onClick={() => change({ ...doc, items: [...doc.items, { group: groupOptions[0]?.value ?? "products", question: "", answer: "" }] })}
        >
          + კითხვა
        </button>
      </div>
      <SaveBar onSave={() => save(() => saveFaq(docs))} pending={pending} status={status} dirty={dirty} />
    </>
  );
}
