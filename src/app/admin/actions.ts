"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { locales, type Locale } from "@/i18n/config";
import { checkCredentials, endSession, isAdmin, isPasswordConfigured, startSession } from "@/lib/admin/auth";
import { CONTENT_TAG, getContentFresh, saveContent } from "@/lib/content/store";
import type { SiteContent } from "@/lib/content/types";
import { db, type Sql } from "@/lib/db";
import { REVIEWS_TAG } from "@/lib/reviews";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/order-status";

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------- auth ----------

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!isPasswordConfigured()) return "ADMIN_PASSWORD არ არის მითითებული სერვერზე.";
  if (!checkCredentials(String(form.get("username") ?? ""), String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return "მომხმარებლის სახელი ან პაროლი არასწორია.";
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ---------- schemas ----------

const slug = z.string().trim().min(1, "slug ცარიელია").regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug: მხოლოდ a-z, 0-9 და ტირე");
const localized = <T extends z.ZodTypeAny>(schema: T) => z.object(Object.fromEntries(locales.map((l) => [l, schema])) as Record<Locale, T>);
const optionalText = z.string().trim().optional().transform((v) => v || undefined);

const variantSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "ვარიაციის სახელი ცარიელია"),
  amount: z.number().nonnegative(),
  unit: z.enum(["mg", "ml"]),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  sku: z.string().trim().min(1, "SKU ცარიელია"),
  inStock: z.boolean(),
  image: optionalText,
});

const productSchema = z.object({
  id: z.string().min(1),
  slug,
  name: z.string().trim().min(1, "სახელი ცარიელია"),
  categorySlug: z.string().min(1, "აირჩიეთ კატეგორია"),
  kind: z.enum(["lyophilized", "solution"]),
  images: z.array(z.string().min(1)),
  variants: z.array(variantSchema).min(1, "საჭიროა მინიმუმ ერთი ვარიაცია"),
  specs: z.object({
    purity: z.string().trim(),
    cas: optionalText,
    formula: optionalText,
    molecularWeight: optionalText,
    sequence: optionalText,
  }),
  badges: z.array(z.enum(["new", "bestseller", "sale"])).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "hidden"]),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: localized(z.object({ shortDescription: z.string(), description: z.string() })),
});

const categorySchema = z.object({
  id: z.string().min(1),
  slug,
  order: z.number(),
  icon: z.enum(["metabolic", "growth", "repair", "longevity", "cognitive", "melanocortin", "supplies"]),
  showInFooter: z.boolean(),
  text: localized(z.object({ name: z.string().trim().min(1, "კატეგორიის სახელი ცარიელია"), description: z.string() })),
});

const settingsSchema = z.object({
  email: z.string().trim().email("ელ-ფოსტა არასწორია"),
  phone: z.string().trim(),
  whatsapp: z.string().trim().regex(/^\+?[\d\s()-]*$/, "WhatsApp: მხოლოდ ნომერი, მაგ. +995 555 12 34 56"),
  hours: localized(z.string().trim()),
  social: z.array(z.object({ label: z.string().trim().min(1), href: z.string().trim().min(1) })),
  bank: z.object({ recipient: z.string().trim(), bankName: z.string().trim(), iban: z.string().trim().toUpperCase() }),
});

const coaSchema = z.object({
  id: z.string().min(1),
  productSlug: z.string().min(1),
  lot: z.string().trim().min(1, "ლოტის ნომერი ცარიელია"),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "თარიღი არასწორია"),
  purity: z.string().trim(),
  method: z.string().trim(),
  fileUrl: optionalText,
});

const faqSchema = z.object({
  groups: z.record(z.string(), z.string().trim().min(1)),
  items: z.array(
    z.object({
      group: z.string().min(1),
      question: z.string().trim().min(1, "კითხვა ცარიელია"),
      answer: z.string().trim().min(1, "პასუხი ცარიელია"),
      home: z.boolean().optional(),
    }),
  ),
});

const legalSchema = z.array(
  z.object({
    slug,
    title: z.string().trim().min(1),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sections: z.array(z.object({ id: z.string().min(1), title: z.string().trim().min(1), paragraphs: z.array(z.string()) })),
  }),
);

const textsSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

// ---------- helpers ----------

async function mutate(run: (content: SiteContent) => Promise<string | void>): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "სესია ამოიწურა - შედით თავიდან." };
  try {
    const error = await run(await getContentFresh());
    if (error) return { ok: false, error };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "შენახვა ვერ მოხერხდა" };
  }
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Validates input; a failure is thrown and shown to the admin by mutate(). */
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new Error(`${issue.message}${issue.path.length ? ` (${issue.path.join(".")})` : ""}`);
}


// ---------- products ----------

export async function saveProduct(input: unknown): Promise<ActionResult> {
  return mutate(async (content) => {
    const parsed = parse(productSchema, input);
    // A variant may only point at one of the product's own photos.
    const data = { ...parsed, variants: parsed.variants.map((v) => (v.image && !parsed.images.includes(v.image) ? { ...v, image: undefined } : v)) };
    if (content.products.some((p) => p.slug === data.slug && p.id !== data.id)) return `slug „${data.slug}“ უკვე გამოყენებულია`;
    const skus = data.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) return "ვარიაციების SKU-ები უნდა განსხვავდებოდეს";
    const previous = content.products.find((p) => p.id === data.id);
    const products = previous ? content.products.map((p) => (p.id === data.id ? data : p)) : [...content.products, data];
    await saveContent("products", products);
    // Certificates point at the product by slug; keep them attached after a rename.
    if (previous && previous.slug !== data.slug) {
      await saveContent("coa", content.coa.map((d) => (d.productSlug === previous.slug ? { ...d, productSlug: data.slug } : d)));
    }
  });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return mutate(async (content) => {
    await saveContent("products", content.products.filter((p) => p.id !== id));
  });
}

// ---------- the rest ----------

export async function saveCategories(input: unknown): Promise<ActionResult> {
  return mutate(async (content) => {
    const data = parse(z.array(categorySchema), input);
    const slugs = data.map((c) => c.slug);
    if (new Set(slugs).size !== slugs.length) return "კატეგორიების slug-ები უნდა განსხვავდებოდეს";
    const orphan = content.products.find((p) => !slugs.includes(p.categorySlug));
    if (orphan) return `კატეგორიას იყენებს პროდუქტი „${orphan.name}“ - ჯერ პროდუქტი გადაიტანეთ სხვა კატეგორიაში`;
    await saveContent("categories", data);
  });
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  return mutate(async () => {
    const data = parse(settingsSchema, input);
    await saveContent("settings", data);
  });
}

export async function saveCoa(input: unknown): Promise<ActionResult> {
  return mutate(async () => {
    const data = parse(z.array(coaSchema), input);
    await saveContent("coa", data);
  });
}

export async function saveFaq(input: unknown): Promise<ActionResult> {
  return mutate(async () => {
    const data = parse(localized(faqSchema), input);
    await saveContent("faq", data);
  });
}

export async function saveLegal(input: unknown): Promise<ActionResult> {
  return mutate(async () => {
    const data = parse(localized(legalSchema), input);
    await saveContent("legal", data);
  });
}

/** Saves the overrides of one dictionary section (e.g. "footer") for all languages. */
export async function saveTexts(section: string, input: unknown): Promise<ActionResult> {
  return mutate(async (content) => {
    const data = parse(localized(textsSchema), input);
    const inSection = (path: string) => path === section || path.startsWith(`${section}.`);
    const next = { ...content.texts };
    for (const l of locales) {
      const kept = Object.fromEntries(Object.entries(content.texts[l] ?? {}).filter(([path]) => !inSection(path)));
      const added = Object.fromEntries(Object.entries(data[l]).filter(([path]) => inSection(path)));
      next[l] = { ...kept, ...added };
    }
    await saveContent("texts", next);
  });
}

// ---------- reviews ----------

export async function setReviewStatus(id: number, status: "approved" | "rejected" | "pending"): Promise<ActionResult> {
  return moderate(async (sql) => {
    await sql`update reviews set status = ${status} where id = ${id}`;
  });
}

export async function deleteReview(id: number): Promise<ActionResult> {
  return moderate(async (sql) => {
    await sql`delete from reviews where id = ${id}`;
  });
}

async function moderate(run: (sql: Sql) => Promise<void>): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "სესია ამოიწურა - შედით თავიდან." };
  const sql = await db();
  if (!sql) return { ok: false, error: "ბაზა არ არის დაკავშირებული." };
  await run(sql);
  updateTag(REVIEWS_TAG);
  // Reviews appear on the lab results page and on product pages.
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------- orders ----------

export async function setOrderStatus(id: number, status: OrderStatus): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "სესია ამოიწურა - შედით თავიდან." };
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "უცნობი სტატუსი" };
  const sql = await db();
  if (!sql) return { ok: false, error: "ბაზა არ არის დაკავშირებული." };
  await sql`update orders set status = ${status} where id = ${id}`;
  return { ok: true };
}
