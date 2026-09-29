import { getOrders } from "@/lib/admin/orders";
import { PageTitle } from "@/components/admin/ui";
import { OrdersList, type OrderProductInfo } from "@/components/admin/OrdersList";
import { getContentFresh } from "@/lib/content/store";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const metadata = { title: "შეკვეთები" };

export default async function OrdersPage() {
  const [orders, { products }] = await Promise.all([getOrders(), getContentFresh()]);
  // Photo and links for every size, looked up by the variant id stored on the order line.
  const info: OrderProductInfo = Object.fromEntries(
    products.flatMap((p) => p.variants.map((v) => [v.id, { image: v.image ?? p.images[0], productId: p.id, slug: p.slug }])),
  );
  return (
    <>
      <PageTitle title="შეკვეთები" description="საიტიდან შემოსული შეკვეთები (სია თავისით ახლდება ყოველ 30 წამში). შეცვალეთ სტატუსი დამუშავების მიხედვით — მომხმარებელი მას თავის კაბინეტში ხედავს." />
      <OrdersList orders={orders} products={info} />
      <AutoRefresh />
    </>
  );
}
