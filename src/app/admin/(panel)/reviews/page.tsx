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
        description="მომხმარებლების შეფასებები საიტზე მაშინვე ქვეყნდება. თუ რომელიმე შეუსაბამოა (მაგ. დოზირება ან ადამიანზე გამოყენება), დამალეთ ან წაშალეთ."
      />
      <ReviewsModeration reviews={reviews} productNames={names} />
    </>
  );
}
