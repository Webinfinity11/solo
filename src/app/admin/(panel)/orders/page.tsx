import { getOrders } from "@/lib/admin/orders";
import { PageTitle } from "@/components/admin/ui";
import { OrdersList } from "@/components/admin/OrdersList";

export const metadata = { title: "შეკვეთები" };

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <>
      <PageTitle title="შეკვეთები" description="საიტიდან შემოსული შეკვეთები. შეცვალეთ სტატუსი დამუშავების მიხედვით." />
      <OrdersList orders={orders} />
    </>
  );
}
