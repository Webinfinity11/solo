import { getContentFresh } from "@/lib/content/store";
import { FaqEditor } from "@/components/admin/FaqEditor";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { faq } = await getContentFresh();
  return <FaqEditor initial={faq} />;
}
