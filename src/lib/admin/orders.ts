// Orders as the admin sees them.
import { db } from "@/lib/db";
import type { OrderItem } from "@/lib/orders";
import type { OrderStatus } from "./order-status";

export type AdminOrder = {
  id: number;
  number: string;
  status: OrderStatus;
  payment: "bank" | "cod";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  note: string;
  items: OrderItem[];
  total: number;
  currency: string;
  lang: string;
  createdAt: string;
};

export async function getOrders(): Promise<AdminOrder[]> {
  const sql = await db();
  if (!sql) return [];
  const rows = (await sql`select * from orders order by created_at desc limit 500`) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as number,
    number: r.number as string,
    status: r.status as OrderStatus,
    payment: r.payment as AdminOrder["payment"],
    firstName: r.first_name as string,
    lastName: r.last_name as string,
    phone: r.phone as string,
    email: r.email as string,
    city: r.city as string,
    address: r.address as string,
    note: r.note as string,
    items: r.items as OrderItem[],
    total: Number(r.total),
    currency: r.currency as string,
    lang: r.lang as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}
