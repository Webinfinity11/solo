import { getContentFresh } from "@/lib/content/store";
import { CoaEditor } from "@/components/admin/CoaEditor";

export const metadata = { title: "COA სერტიფიკატები" };

export default async function CoaPage() {
  const { coa, products } = await getContentFresh();
  return <CoaEditor initial={coa} products={products.map((p) => ({ value: p.slug, label: p.name }))} />;
}
