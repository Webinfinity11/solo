import { getAllReviews } from "@/lib/reviews";
import { getContentFresh } from "@/lib/content/store";
import { PageTitle } from "@/components/admin/ui";
import { ReviewsModeration } from "@/components/admin/ReviewsModeration";

export const metadata = { title: "შეფასებები" };

export default async function ReviewsPage() {
  const [reviews, { products }] = await Promise.all([getAllReviews(), getContentFresh()]);
  const names = Object.fromEntries(products.map((p) => [p.slug, p.name]));
  return (
    <>
      <PageTitle
        title="შეფასებები"
        description="მომხმარებლების შეფასებები ლაბ. შედეგების გვერდიდან. საიტზე ჩანს მხოლოდ დამტკიცებული. არ დაამტკიცოთ შეფასება, რომელშიც დოზირება ან ადამიანზე გამოყენებაა ნახსენები."
      />
      <ReviewsModeration reviews={reviews} productNames={names} />
    </>
  );
}
