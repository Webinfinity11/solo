// Language-neutral product records. Descriptions and localized spec labels live in
// data/i18n/<locale>/products.ts.
// Photos: public/images/products/<slug>-<size>.webp, one per size (see PHOTOS).
// A product without photos renders the vector vial.
// PRICES ARE TEST VALUES (10 GEL each). CAS / formula / weight / sequence are reference values
// that must be checked against the supplier's documentation before launch.
import type { ProductBadge, Variant } from "@/lib/types";

export type ProductKind = "lyophilized" | "solution";

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  kind: ProductKind;
  images: string[];
  variants: Variant[];
  specs: {
    purity: string;
    cas?: string;
    formula?: string;
    molecularWeight?: string;
    sequence?: string;
  };
  badges?: ProductBadge[];
  featured?: boolean;
  status: "active" | "hidden";
  createdAt: string;
};

function variants(slug: string, list: [label: string, price: number, inStock?: boolean][]): Variant[] {
  return list.map(([label, price, inStock = true]) => {
    const match = /^(\d+)(mg|ml)$/.exec(label);
    if (!match) throw new Error(`Bad variant label ${label}`);
    return {
      id: `${slug}-${label}`,
      label,
      amount: Number(match[1]),
      unit: match[2] as "mg" | "ml",
      price,
      sku: `SR-${slug.toUpperCase()}-${label.toUpperCase()}`,
      inStock,
    };
  });
}


const records: ProductRecord[] = [
  {
    id: "p1",
    slug: "retatrutide",
    name: "Retatrutide",
    categorySlug: "glp-1-metabolic",
    kind: "lyophilized",
    images: [],
    variants: variants("retatrutide", [["10mg", 10], ["20mg", 10], ["40mg", 10, false]]),
    specs: { purity: "≥99%", cas: "2381089-83-2", formula: "C221H342N46O68", molecularWeight: "4731.3 g/mol" },
    badges: ["bestseller", "new"],
    featured: true,
    status: "active",
    createdAt: "2026-08-20",
  },
  {
    id: "p2",
    slug: "tirzepatide",
    name: "Tirzepatide",
    categorySlug: "glp-1-metabolic",
    kind: "lyophilized",
    images: [],
    variants: variants("tirzepatide", [["10mg", 10], ["20mg", 10], ["40mg", 10]]),
    specs: { purity: "≥99%", cas: "2023788-19-2", formula: "C225H348N48O68", molecularWeight: "4813.5 g/mol" },
    badges: ["bestseller"],
    featured: true,
    status: "active",
    createdAt: "2026-06-10",
  },
  {
    id: "p3",
    slug: "semaglutide",
    name: "Semaglutide",
    categorySlug: "glp-1-metabolic",
    kind: "lyophilized",
    images: [],
    variants: variants("semaglutide", [["10mg", 10], ["20mg", 10], ["40mg", 10]]),
    specs: { purity: "≥99%", cas: "910463-68-2", formula: "C187H291N45O59", molecularWeight: "4113.6 g/mol" },
    badges: ["bestseller"],
    featured: true,
    status: "active",
    createdAt: "2026-05-02",
  },
  {
    id: "p4",
    slug: "aod-9604",
    name: "AOD-9604",
    categorySlug: "glp-1-metabolic",
    kind: "lyophilized",
    images: [],
    variants: variants("aod-9604", [["5mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "221231-10-3",
      formula: "C78H123N23O23S2",
      molecularWeight: "1815.1 g/mol",
      sequence: "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe",
    },
    status: "active",
    createdAt: "2026-04-15",
  },
  {
    id: "p5",
    slug: "tesamorelin",
    name: "Tesamorelin",
    categorySlug: "growth-hormone",
    kind: "lyophilized",
    images: [],
    variants: variants("tesamorelin", [["10mg", 10], ["20mg", 10]]),
    specs: { purity: "≥99%", cas: "218949-48-5", formula: "C221H366N72O67S", molecularWeight: "5135.9 g/mol" },
    status: "active",
    createdAt: "2026-04-01",
  },
  {
    id: "p6",
    slug: "ipamorelin",
    name: "Ipamorelin",
    categorySlug: "growth-hormone",
    kind: "lyophilized",
    images: [],
    variants: variants("ipamorelin", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "170851-70-4",
      formula: "C38H49N9O5",
      molecularWeight: "711.9 g/mol",
      sequence: "Aib-His-D-2Nal-D-Phe-Lys-NH2",
    },
    badges: ["new"],
    status: "active",
    createdAt: "2026-07-22",
  },
  {
    id: "p7",
    slug: "cjc-1295-no-dac",
    name: "CJC-1295 (No DAC)",
    categorySlug: "growth-hormone",
    kind: "lyophilized",
    images: [],
    variants: variants("cjc-1295-no-dac", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "863288-34-0",
      formula: "C152H252N44O42",
      molecularWeight: "3367.9 g/mol",
      sequence: "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2",
    },
    status: "active",
    createdAt: "2026-03-18",
  },
  {
    id: "p8",
    slug: "bpc-157",
    name: "BPC-157",
    categorySlug: "recovery-repair",
    kind: "lyophilized",
    images: [],
    variants: variants("bpc-157", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "137525-51-0",
      formula: "C62H98N16O22",
      molecularWeight: "1419.5 g/mol",
      sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    },
    badges: ["new"],
    featured: true,
    status: "active",
    createdAt: "2026-08-05",
  },
  {
    id: "p9",
    slug: "tb-500",
    name: "TB-500",
    categorySlug: "recovery-repair",
    kind: "lyophilized",
    images: [],
    variants: variants("tb-500", [["10mg", 10]]),
    specs: { purity: "≥99%", cas: "77591-33-4", formula: "C212H350N56O78S", molecularWeight: "4963.5 g/mol" },
    badges: ["new"],
    status: "active",
    createdAt: "2026-08-05",
  },
  {
    id: "p10",
    slug: "ghk-cu",
    name: "GHK-Cu",
    categorySlug: "recovery-repair",
    kind: "lyophilized",
    images: [],
    variants: variants("ghk-cu", [["100mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "49557-75-7",
      formula: "C14H22CuN6O4",
      molecularWeight: "401.9 g/mol",
      sequence: "Gly-His-Lys · Cu(II)",
    },
    status: "active",
    createdAt: "2026-02-11",
  },
  {
    id: "p11",
    slug: "nad-plus",
    name: "NAD+",
    categorySlug: "longevity-cellular",
    kind: "lyophilized",
    images: [],
    variants: variants("nad-plus", [["500mg", 10], ["1000mg", 10]]),
    specs: { purity: "≥99%", cas: "53-84-9", formula: "C21H27N7O14P2", molecularWeight: "663.4 g/mol" },
    status: "active",
    createdAt: "2026-06-28",
  },
  {
    id: "p12",
    slug: "mots-c",
    name: "MOTS-C",
    categorySlug: "longevity-cellular",
    kind: "lyophilized",
    images: [],
    variants: variants("mots-c", [["10mg", 10], ["20mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "1627580-64-6",
      formula: "C101H152N28O22S2",
      molecularWeight: "2174.6 g/mol",
      sequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
    },
    status: "active",
    createdAt: "2026-05-19",
  },
  {
    id: "p13",
    slug: "glutathione",
    name: "Glutathione",
    categorySlug: "longevity-cellular",
    kind: "lyophilized",
    images: [],
    variants: variants("glutathione", [["600mg", 10], ["1500mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "70-18-8",
      formula: "C10H17N3O6S",
      molecularWeight: "307.3 g/mol",
      sequence: "γ-Glu-Cys-Gly",
    },
    status: "active",
    createdAt: "2026-01-30",
  },
  {
    id: "p14",
    slug: "selank",
    name: "Selank",
    categorySlug: "cognitive",
    kind: "lyophilized",
    images: [],
    variants: variants("selank", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "129954-34-3",
      formula: "C33H57N11O9",
      molecularWeight: "751.9 g/mol",
      sequence: "Thr-Lys-Pro-Arg-Pro-Gly-Pro",
    },
    status: "active",
    createdAt: "2026-03-05",
  },
  {
    id: "p15",
    slug: "melanotan-1",
    name: "Melanotan-I",
    categorySlug: "melanocortins",
    kind: "lyophilized",
    images: [],
    variants: variants("melanotan-1", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "75921-69-6",
      formula: "C78H111N21O19",
      molecularWeight: "1646.9 g/mol",
      sequence: "Ac-Ser-Tyr-Ser-Nle-Glu-His-D-Phe-Arg-Trp-Gly-Lys-Pro-Val-NH2",
    },
    status: "active",
    createdAt: "2026-02-20",
  },
  {
    id: "p16",
    slug: "melanotan-2",
    name: "Melanotan-II",
    categorySlug: "melanocortins",
    kind: "lyophilized",
    images: [],
    variants: variants("melanotan-2", [["10mg", 10]]),
    specs: {
      purity: "≥99%",
      cas: "121062-08-6",
      formula: "C50H69N15O9",
      molecularWeight: "1024.2 g/mol",
      sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
    },
    status: "active",
    createdAt: "2026-02-20",
  },
  {
    id: "p17",
    slug: "bac-water",
    name: "Bacteriostatic Water",
    categorySlug: "lab-supplies",
    kind: "solution",
    images: [],
    variants: variants("bac-water", [["3ml", 10], ["5ml", 10], ["10ml", 10]]),
    specs: { purity: "USP" },
    status: "active",
    createdAt: "2026-01-10",
  },
];

// Sizes that have a photo, as "<slug>-<label>".
const PHOTOS = new Set([
  "retatrutide-10mg", "retatrutide-20mg", "retatrutide-40mg",
  "tirzepatide-10mg", "tirzepatide-20mg", "tirzepatide-40mg",
  "semaglutide-10mg", "semaglutide-20mg", "semaglutide-40mg",
  "tesamorelin-10mg", "tesamorelin-20mg",
  "mots-c-10mg", "mots-c-20mg",
  "nad-plus-500mg", "nad-plus-1000mg",
  "bac-water-3ml", "bac-water-5ml", "bac-water-10ml",
  "aod-9604-5mg", "bpc-157-10mg", "cjc-1295-no-dac-10mg", "ipamorelin-10mg",
  "melanotan-1-10mg", "melanotan-2-10mg", "ghk-cu-100mg", "selank-10mg", "tb-500-10mg",
]);

export const products: ProductRecord[] = records.map((p) => {
  const variants = p.variants.map((v) => {
    const key = `${p.slug}-${v.label}`;
    return PHOTOS.has(key) ? { ...v, image: `/images/products/${key}.webp` } : v;
  });
  const images = variants.flatMap((v) => (v.image ? [v.image] : []));
  return { ...p, variants, images: images.length ? images : p.images };
});
