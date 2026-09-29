import { notFound } from "next/navigation";
import { getContentFresh } from "@/lib/content/store";
import type { StoredProduct } from "@/lib/content/types";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata = { title: "პროდუქტი" };

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { products, categories } = await getContentFresh();
  const isNew = id === "new";
  const product = isNew ? undefined : products.find((p) => p.id === id);
  if (!isNew && !product) notFound();

  const blank: StoredProduct = {
    id: `p-${Date.now().toString(36)}`,
    slug: "",
    name: "",
    categorySlug: categories[0]?.slug ?? "",
    kind: "lyophilized",
    images: [],
    variants: [],
    specs: { purity: "≥99%" },
    badges: [],
    featured: false,
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
    text: { ka: { shortDescription: "", description: "" }, en: { shortDescription: "", description: "" }, ru: { shortDescription: "", description: "" } },
  };

  return (
    <ProductEditor
      key={id}
      initial={product ?? blank}
      isNew={isNew}
      categories={categories.map((c) => ({ value: c.slug, label: c.text.ka.name }))}
    />
  );
}
