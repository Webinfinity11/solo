// Promo codes with each creator's sales and commission, as the admin sees them.
import { db } from "@/lib/db";
import type { OrderStatus } from "./order-status";

export type PromoOrder = { number: string; status: OrderStatus; total: number; commission: number; createdAt: string };
export type PromoPayout = { id: number; amount: number; note: string; createdAt: string };

export type AdminPromo = {
  id: number;
  code: string;
  owner: string;
  contact: string;
  discountPercent: number;
  commissionPercent: number;
  active: boolean;
  createdAt: string;
  orders: PromoOrder[];
  payouts: PromoPayout[];
  /** Commission on completed orders: what the creator has earned. */
  earned: number;
  /** Commission on orders still in progress (new, paid, shipped). */
  pending: number;
  paidOut: number;
  /** Sum the buyers paid on completed orders. */
  sales: number;
};

const sum = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;

export async function getPromoCodes(): Promise<AdminPromo[]> {
  const sql = await db();
  if (!sql) return [];
  const [codes, orders, payouts] = await Promise.all([
    sql`select * from promo_codes order by created_at desc` as Promise<Record<string, unknown>[]>,
    sql`select promo_code_id, number, status, total, commission, created_at from orders
        where promo_code_id is not null order by created_at desc` as Promise<Record<string, unknown>[]>,
    sql`select * from promo_payouts order by created_at desc` as Promise<Record<string, unknown>[]>,
  ]);
  return codes.map((c) => {
    const own = orders
      .filter((o) => o.promo_code_id === c.id)
      .map((o) => ({
        number: o.number as string,
        status: o.status as OrderStatus,
        total: Number(o.total),
        commission: Number(o.commission),
        createdAt: new Date(o.created_at as string).toISOString(),
      }));
    const paid = payouts
      .filter((p) => p.promo_code_id === c.id)
      .map((p) => ({ id: p.id as number, amount: Number(p.amount), note: p.note as string, createdAt: new Date(p.created_at as string).toISOString() }));
    const completed = own.filter((o) => o.status === "completed");
    return {
      id: c.id as number,
      code: c.code as string,
      owner: c.owner as string,
      contact: c.contact as string,
      discountPercent: Number(c.discount_percent),
      commissionPercent: Number(c.commission_percent),
      active: c.active as boolean,
      createdAt: new Date(c.created_at as string).toISOString(),
      orders: own,
      payouts: paid,
      earned: sum(completed.map((o) => o.commission)),
      pending: sum(own.filter((o) => ["new", "paid", "shipped"].includes(o.status)).map((o) => o.commission)),
      paidOut: sum(paid.map((p) => p.amount)),
      sales: sum(completed.map((o) => o.total)),
    };
  });
}
