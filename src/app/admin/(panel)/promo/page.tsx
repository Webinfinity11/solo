import { PageTitle } from "@/components/admin/ui";
import { PromoCodesEditor } from "@/components/admin/PromoCodesEditor";
import { getPromoCodes } from "@/lib/admin/promo";
import { site } from "@/data/site";

export const metadata = { title: "პრომო კოდები" };

export default async function PromoPage() {
  const promos = await getPromoCodes();
  return (
    <>
      <PageTitle
        title="პრომო კოდები"
        description="კოდები კონტენტ-კრეატორებისთვის: მყიდველი კოდით იღებს ფასდაკლებას, კრეატორს ეკუთვნის საკომისიო მყიდველის გადახდილი თანხიდან. საკომისიო ითვლება, როცა შეკვეთა „დასრულებულია“."
      />
      <PromoCodesEditor promos={promos} siteUrl={site.url} />
    </>
  );
}
