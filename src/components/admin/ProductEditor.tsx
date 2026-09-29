"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { ProductBadge, Variant } from "@/lib/types";
import type { StoredProduct } from "@/lib/content/types";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";
import {
  Checkbox,
  LangTabs,
  NumberInput,
  PageTitle,
  SaveBar,
  Section,
  Select,
  TextArea,
  TextInput,
  UploadButton,
  move,
  newId,
  useSave,
} from "./ui";

const BADGES: { value: ProductBadge; label: string }[] = [
  { value: "new", label: "ახალი" },
  { value: "bestseller", label: "ბესტსელერი" },
  { value: "sale", label: "ფასდაკლება" },
];

function variantLabel(amount: number, unit: Variant["unit"]) {
  return `${amount}${unit}`;
}

export function ProductEditor({ initial, isNew, categories }: { initial: StoredProduct; isNew: boolean; categories: { value: string; label: string }[] }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [lang, setLang] = useState<Locale>("ka");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const { save, pending, status, dirty, markDirty } = useSave();

  function update(patch: Partial<StoredProduct>) {
    setP((prev) => ({ ...prev, ...patch }));
    markDirty();
  }
  const setSpec = (key: keyof StoredProduct["specs"], value: string) => update({ specs: { ...p.specs, [key]: value } });
  const setText = (key: "shortDescription" | "description", value: string) => update({ text: { ...p.text, [lang]: { ...p.text[lang], [key]: value } } });
  const setVariant = (i: number, patch: Partial<Variant>) =>
    update({
      variants: p.variants.map((v, j) => {
        if (j !== i) return v;
        const next = { ...v, ...patch };
        if (patch.amount !== undefined || patch.unit) next.label = variantLabel(next.amount, next.unit);
        return next;
      }),
    });

  function addVariant() {
    const last = p.variants.at(-1);
    const unit = last?.unit ?? (p.kind === "solution" ? "ml" : "mg");
    const amount = last ? last.amount * 2 : 10;
    const label = variantLabel(amount, unit);
    update({
      variants: [
        ...p.variants,
        { id: newId(p.slug || "v"), label, amount, unit, price: last?.price ?? 0, sku: `SR-${(p.slug || "NEW").toUpperCase()}-${label.toUpperCase()}`, inStock: true },
      ],
    });
  }

  function onSave() {
    save(
      () => saveProduct(p),
      () => {
        if (isNew) router.replace(`/admin/products/${p.id}`);
      },
    );
  }

  function onDelete() {
    if (!window.confirm(`წავშალო „${p.name || "პროდუქტი"}“? ამის დაბრუნება შეუძლებელია.`)) return;
    save(
      () => deleteProduct(p.id),
      () => router.push("/admin/products"),
    );
  }

  return (
    <>
      <PageTitle
        title={isNew ? "ახალი პროდუქტი" : p.name || "პროდუქტი"}
        actions={
          <div className="flex gap-2">
            {!isNew && p.status === "active" ? (
              <a href={`/products/${initial.slug}`} target="_blank" className="adm-btn">
                საიტზე ნახვა ↗
              </a>
            ) : null}
            <Link href="/admin/products" className="adm-btn">
              ← სია
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Section title="ძირითადი">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="სახელი (ყველა ენაზე ერთნაირი)"
                value={p.name}
                onChange={(name) => update(slugTouched ? { name } : { name, slug: slugify(name) })}
              />
              <TextInput
                label="URL (slug)"
                value={p.slug}
                onChange={(v) => {
                  setSlugTouched(true);
                  update({ slug: v });
                }}
                hint={p.slug ? `/products/${p.slug}` : "ლათინური პატარა ასოები, ციფრები და ტირე"}
              />
              <Select label="კატეგორია" value={p.categorySlug} onChange={(categorySlug) => update({ categorySlug })} options={categories} />
              <Select
                label="ფორმა"
                value={p.kind}
                onChange={(kind) => update({ kind })}
                options={[
                  { value: "lyophilized", label: "ლიოფილიზებული ფხვნილი" },
                  { value: "solution", label: "ხსნარი" },
                ]}
              />
            </div>
          </Section>

          <Section
            title="ვარიაციები"
            actions={
              <button type="button" className="adm-btn" onClick={addVariant}>
                + ვარიაცია
              </button>
            }
          >
            {p.variants.length === 0 ? <p className="text-[14px] text-muted">დაამატეთ მინიმუმ ერთი ვარიაცია (მაგ. 10mg).</p> : null}
            <div className="flex flex-col gap-3">
              {p.variants.map((v, i) => (
                <div key={v.id} className="grid grid-cols-2 items-end gap-3 border border-line bg-mist p-3 sm:grid-cols-[90px_80px_100px_100px_1fr_auto]">
                  <NumberInput label="რაოდენობა" value={v.amount} onChange={(amount) => setVariant(i, { amount: amount ?? 0 })} />
                  <Select
                    label="ერთეული"
                    value={v.unit}
                    onChange={(unit) => setVariant(i, { unit })}
                    options={[
                      { value: "mg", label: "mg" },
                      { value: "ml", label: "ml" },
                    ]}
                  />
                  <NumberInput label="ფასი ($)" value={v.price} onChange={(price) => setVariant(i, { price: price ?? 0 })} />
                  <NumberInput label="ძველი ფასი" value={v.compareAtPrice} onChange={(compareAtPrice) => setVariant(i, { compareAtPrice })} />
                  <TextInput label="SKU" value={v.sku} onChange={(sku) => setVariant(i, { sku })} />
                  <div className="col-span-2 flex items-center gap-2 pb-1.5 sm:col-span-1">
                    <Checkbox label="მარაგშია" checked={v.inStock} onChange={(inStock) => setVariant(i, { inStock })} />
                    <button type="button" className="adm-btn px-2" title="ზემოთ" onClick={() => update({ variants: move(p.variants, i, -1) })}>
                      ↑
                    </button>
                    <button type="button" className="adm-btn adm-btn-danger px-2" title="წაშლა" onClick={() => update({ variants: p.variants.filter((_, j) => j !== i) })}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted">ფასები საიტზე ახლა დამალულია (კატალოგის რეჟიმი), მაგრამ შენახვა მაინც შეიძლება.</p>
          </Section>

          <Section title="აღწერა" actions={<LangTabs value={lang} onChange={setLang} />}>
            <div className="flex flex-col gap-4">
              <TextArea label="მოკლე აღწერა" rows={2} value={p.text[lang].shortDescription} onChange={(v) => setText("shortDescription", v)} />
              <TextArea
                label="სრული აღწერა"
                rows={8}
                value={p.text[lang].description}
                onChange={(v) => setText("description", v)}
                hint="აბზაცები გამოყავით ცარიელი ხაზით."
              />
            </div>
          </Section>

          <Section title="სპეციფიკაცია">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="სისუფთავე" value={p.specs.purity} onChange={(v) => setSpec("purity", v)} />
              <TextInput label="CAS" value={p.specs.cas ?? ""} onChange={(v) => setSpec("cas", v)} />
              <TextInput label="ფორმულა" value={p.specs.formula ?? ""} onChange={(v) => setSpec("formula", v)} />
              <TextInput label="მოლეკულური მასა" value={p.specs.molecularWeight ?? ""} onChange={(v) => setSpec("molecularWeight", v)} />
              <TextArea label="თანმიმდევრობა" rows={2} className="sm:col-span-2" value={p.specs.sequence ?? ""} onChange={(v) => setSpec("sequence", v)} />
            </div>
          </Section>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Section title="გამოქვეყნება">
            <div className="flex flex-col gap-4">
              <Select
                label="სტატუსი"
                value={p.status}
                onChange={(status) => update({ status })}
                options={[
                  { value: "active", label: "აქტიური — ჩანს საიტზე" },
                  { value: "hidden", label: "დამალული" },
                ]}
              />
              <Checkbox label="მთავარ გვერდზე (რჩეული)" checked={Boolean(p.featured)} onChange={(featured) => update({ featured })} />
              <div>
                <p className="adm-label">ნიშნები</p>
                <div className="flex flex-wrap gap-4">
                  {BADGES.map((b) => (
                    <Checkbox
                      key={b.value}
                      label={b.label}
                      checked={Boolean(p.badges?.includes(b.value))}
                      onChange={(on) => update({ badges: on ? [...(p.badges ?? []), b.value] : (p.badges ?? []).filter((x) => x !== b.value) })}
                    />
                  ))}
                </div>
              </div>
              <TextInput label="დამატების თარიღი" type="date" value={p.createdAt} onChange={(createdAt) => update({ createdAt })} hint="გამოიყენება „უახლესი“ დალაგებისთვის." />
            </div>
          </Section>

          <Section title="ფოტოები" actions={<UploadButton label="+ ატვირთვა" accept="image/*" multiple folder="products" onUploaded={(urls) => update({ images: [...p.images, ...urls] })} />}>
            {p.images.length === 0 ? <p className="text-[13px] text-muted">ფოტოს გარეშე საიტი აჩვენებს ფლაკონის ილუსტრაციას. სასურველია ≥600px, თეთრ ან გამჭვირვალე ფონზე.</p> : null}
            <ul className="grid grid-cols-2 gap-3">
              {p.images.map((src, i) => (
                <li key={src} className="border border-line">
                  <div className="aspect-square bg-ice">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-contain" />
                  </div>
                  <div className="flex items-center justify-between gap-1 p-1.5">
                    <span className="text-[11px] font-bold text-muted">{i === 0 ? "მთავარი" : ""}</span>
                    <span className="flex gap-1">
                      <button type="button" className="adm-btn min-h-0 px-2 py-1" title="წინ" onClick={() => update({ images: move(p.images, i, -1) })}>
                        ←
                      </button>
                      <button type="button" className="adm-btn adm-btn-danger min-h-0 px-2 py-1" title="წაშლა" onClick={() => update({ images: p.images.filter((_, j) => j !== i) })}>
                        ✕
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      <SaveBar onSave={onSave} pending={pending} status={status} dirty={dirty}>
        {!isNew ? (
          <button type="button" className="adm-btn adm-btn-danger" onClick={onDelete} disabled={pending}>
            პროდუქტის წაშლა
          </button>
        ) : null}
      </SaveBar>
    </>
  );
}
