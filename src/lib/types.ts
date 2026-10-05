// Shapes the pages and components work with. Data comes from lib/api/*, which
// merges language-neutral records (src/data) with translated copy
// (src/data/i18n/<locale>). When the admin API arrives, only lib/api changes.

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Optional search-result title and description set in the admin; empty = name / description. */
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
  order: number;
};

export type Variant = {
  id: string;
  label: string; // "10mg", "5ml"
  amount: number;
  unit: "mg" | "ml";
  price: number;
  compareAtPrice?: number;
  sku: string;
  inStock: boolean;
  /** Photo of this size's vial; also listed in the product's images. */
  image?: string;
};

export type ProductSpecs = {
  form: string;
  purity: string;
  storage: string;
  appearance?: string;
  cas?: string;
  formula?: string;
  molecularWeight?: string;
  sequence?: string;
};

export type ProductBadge = "new" | "bestseller" | "sale";

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string; // paragraphs separated by blank lines
  /** Optional search-result title and description set in the admin; empty = the defaults. */
  seoTitle?: string;
  seoDescription?: string;
  images: string[];
  variants: Variant[];
  specs: ProductSpecs;
  badges?: ProductBadge[];
  featured?: boolean;
  status: "active" | "hidden";
  createdAt: string; // ISO date, used for "newest" sorting
};

export type CoaDocument = {
  id: string;
  productSlug: string;
  lot: string;
  testDate: string;
  purity: string;
  method: string;
  fileUrl?: string; // empty until the PDF is uploaded
};

export type CartItem = {
  productSlug: string;
  variantId: string;
  quantity: number;
};

export type FaqItem = { group: string; question: string; answer: string };

export type LegalSection = { id: string; title: string; paragraphs: string[] };
export type LegalDocument = { slug: string; title: string; updated: string; sections: LegalSection[] };
