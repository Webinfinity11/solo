import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { listTextFields } from "@/i18n/overrides";
import { getContentFresh } from "@/lib/content/store";
import { TextsEditor, type TextRow } from "@/components/admin/TextsEditor";

export const metadata = { title: "გვერდების ტექსტები" };

const SECTION_LABELS: Record<string, string> = {
  home: "მთავარი გვერდი",
  ticker: "მორბენალი ზოლი (ზემოთ)",
  nav: "მენიუ",
  footer: "ფუტერი",
  about: "ჩვენ შესახებ",
  quality: "ხარისხი",
  shipping: "მიწოდება",
  wholesale: "საბითუმო",
  coa: "ლაბ. შედეგები (COA)",
  contact: "კონტაქტი",
  faq: "FAQ გვერდი",
  product: "პროდუქტის გვერდი",
  catalog: "კატალოგი",
  search: "ძიება",
  ageGate: "ასაკის ფანჯარა (18+)",
  newsletter: "გამოწერის ფორმა",
  meta: "SEO - საიტის სათაური და აღწერა",
  common: "საერთო ფრაზები",
  cart: "კალათა",
  checkout: "შეკვეთის გაფორმება",
  account: "ანგარიში",
  notFound: "404 გვერდი",
  legal: "იურიდიული (საერთო)",
};

export default async function TextsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const { texts } = await getContentFresh();
  const defaults = Object.fromEntries(locales.map((l) => [l, new Map(listTextFields(getDictionary(l)).map((f) => [f.path, f.value]))]));
  const sectionKeys = Object.keys(getDictionary("ka"));
  const sections = [...Object.keys(SECTION_LABELS).filter((k) => sectionKeys.includes(k)), ...sectionKeys.filter((k) => !(k in SECTION_LABELS))].map((key) => ({
    key,
    label: SECTION_LABELS[key] ?? key,
    changed: Object.keys(texts.ka).concat(Object.keys(texts.en), Object.keys(texts.ru)).some((p) => p === key || p.startsWith(`${key}.`)),
  }));
  const section = sections.find((x) => x.key === s)?.key ?? sections[0].key;

  const rows: TextRow[] = listTextFields(getDictionary("ka"))
    .filter((f) => f.path === section || f.path.startsWith(`${section}.`))
    .map((f) => ({
      path: f.path,
      list: Array.isArray(f.value),
      defaults: Object.fromEntries(locales.map((l) => [l, defaults[l].get(f.path) ?? ""])) as TextRow["defaults"],
      values: Object.fromEntries(locales.map((l) => [l, texts[l]?.[f.path] ?? defaults[l].get(f.path) ?? ""])) as TextRow["values"],
    }));

  return <TextsEditor key={section} sections={sections} section={section} rows={rows} />;
}
