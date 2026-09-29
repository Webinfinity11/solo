import { getContentFresh } from "@/lib/content/store";
import { LegalEditor } from "@/components/admin/LegalEditor";

export const metadata = { title: "იურიდიული გვერდები" };

export default async function LegalPage() {
  const { legal } = await getContentFresh();
  return <LegalEditor initial={legal} />;
}
