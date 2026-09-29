import { getOrders } from "@/lib/admin/orders";
import { PageTitle } from "@/components/admin/ui";
import { OrdersList } from "@/components/admin/OrdersList";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const metadata = { title: "შეკვეთები" };

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <>
      <PageTitle title="შეკვეთები" description="საიტიდან შემოსული შეკვეთები (სია თავისით ახლდება ყოველ 30 წამში). შეცვალეთ სტატუსი დამუშავების მიხედვით — მომხმარებელი მას თავის კაბინეტში ხედავს." />
      <OrdersList orders={orders} />
      <AutoRefresh />
    </>
  );
}
