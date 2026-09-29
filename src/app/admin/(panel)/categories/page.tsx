import { getContentFresh } from "@/lib/content/store";
import { CategoriesEditor } from "@/components/admin/CategoriesEditor";

export const metadata = { title: "კატეგორიები" };

export default async function CategoriesPage() {
  const { categories, products } = await getContentFresh();
  const counts = Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.categorySlug === c.slug).length]));
  return <CategoriesEditor initial={[...categories].sort((a, b) => a.order - b.order)} counts={counts} />;
}
