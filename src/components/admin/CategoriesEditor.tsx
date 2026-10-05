"use client";

import { useState } from "react";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import type { StoredCategory } from "@/lib/content/types";
import { saveCategories } from "@/app/admin/actions";
import { Checkbox, LangTabs, PageTitle, SaveBar, Section, SeoInput, TextArea, TextInput, move, newId, useSave } from "./ui";

export function CategoriesEditor({ initial, counts }: { initial: StoredCategory[]; counts: Record<string, number> }) {
  const [list, setList] = useState(initial);
  const [lang, setLang] = useState<Locale>("ka");
  const { save, pending, status, dirty, markDirty } = useSave();

  function change(next: StoredCategory[]) {
    setList(next);
    markDirty();
  }
  const patch = (i: number, p: Partial<StoredCategory>) => change(list.map((c, j) => (j === i ? { ...c, ...p } : c)));

  function add() {
    const empty = { name: "", description: "" };
    change([...list, { id: newId("c"), slug: "", order: list.length + 1, icon: "supplies", showInFooter: true, text: Object.fromEntries(locales.map((l) => [l, empty])) as StoredCategory["text"] }]);
  }

  return (
    <>
      <PageTitle
        title="კატეგორიები"
        description="სახელები და აღწერები სამ ენაზე, თანმიმდევრობა და ფუტერში ჩვენება. პროდუქტიანი კატეგორიის წაშლა შეუძლებელია."
        actions={<LangTabs value={lang} onChange={setLang} />}
      />
      <div className="flex flex-col gap-4">
        {list.map((c, i) => (
          <Section key={c.id}>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <TextInput
                label={`სახელი (${lang.toUpperCase()})`}
                value={c.text[lang].name}
                onChange={(name) => patch(i, { text: { ...c.text, [lang]: { ...c.text[lang], name } } })}
              />
              <TextInput
                label="URL (slug)"
                value={c.slug}
                onChange={(slug) => patch(i, { slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                disabled={counts[c.slug] > 0 && initial.some((x) => x.id === c.id && x.slug === c.slug)}
                hint={counts[c.slug] ? `${counts[c.slug]} პროდუქტი · slug-ის შეცვლა შეუძლებელია, სანამ კატეგორიაში პროდუქტებია` : "/category/…"}
              />
              <div className="flex items-end gap-1.5">
                <button type="button" className="adm-btn px-2.5" title="ზემოთ" onClick={() => change(move(list, i, -1))}>
                  ↑
                </button>
                <button type="button" className="adm-btn px-2.5" title="ქვემოთ" onClick={() => change(move(list, i, 1))}>
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger px-2.5"
                  title="წაშლა"
                  disabled={counts[c.slug] > 0}
                  onClick={() => change(list.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
              <TextArea
                label={`აღწერა (${lang.toUpperCase()})`}
                rows={2}
                dir={localeMeta[lang].dir}
                className="md:col-span-2"
                value={c.text[lang].description}
                onChange={(description) => patch(i, { text: { ...c.text, [lang]: { ...c.text[lang], description } } })}
              />
              <div className="flex items-end pb-2">
                <Checkbox label="ფუტერში" checked={c.showInFooter} onChange={(showInFooter) => patch(i, { showInFooter })} />
              </div>
              <SeoInput
                label={`SEO სათაური (${lang.toUpperCase()}, არასავალდებულო)`}
                limit={45}
                dir={localeMeta[lang].dir}
                placeholder={c.text[lang].name}
                value={c.text[lang].seoTitle}
                onChange={(seoTitle) => patch(i, { text: { ...c.text, [lang]: { ...c.text[lang], seoTitle } } })}
              />
              <div className="md:col-span-2">
                <SeoInput
                  label={`SEO აღწერა (${lang.toUpperCase()}, არასავალდებულო)`}
                  limit={155}
                  dir={localeMeta[lang].dir}
                  value={c.text[lang].seoDescription}
                  onChange={(seoDescription) => patch(i, { text: { ...c.text, [lang]: { ...c.text[lang], seoDescription } } })}
                />
              </div>
            </div>
          </Section>
        ))}
        <button type="button" className="adm-btn self-start" onClick={add}>
          + კატეგორია
        </button>
      </div>
      <SaveBar onSave={() => save(() => saveCategories(list.map((c, i) => ({ ...c, order: i + 1 }))))} pending={pending} status={status} dirty={dirty} />
    </>
  );
}
