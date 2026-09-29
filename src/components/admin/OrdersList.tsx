"use client";

import { useState } from "react";
import type { AdminOrder } from "@/lib/admin/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/order-status";
import { setOrderStatus } from "@/app/admin/actions";
import { cn, formatPrice } from "@/lib/utils";
import { useSave } from "./ui";

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "ახალი", className: "bg-[#fff4d6] text-[#8a6100]" },
  paid: { label: "გადახდილი", className: "bg-ice text-navy" },
  shipped: { label: "გაგზავნილი", className: "bg-ice text-navy" },
  completed: { label: "დასრულებული", className: "bg-[#eaf5ef] text-success" },
  cancelled: { label: "გაუქმებული", className: "bg-mist text-muted" },
};
const PAYMENT = { bank: "საბანკო გადარიცხვა", cod: "კურიერთან" };

export function OrdersList({ orders }: { orders: AdminOrder[] }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const { save, pending, status } = useSave();
  const visible = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...ORDER_STATUSES] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("adm-btn", filter === f && "adm-btn-primary")}>
            {f === "all" ? `ყველა (${orders.length})` : `${STATUS[f].label} (${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
        {status && !status.ok ? <p className="text-[13px] font-bold text-danger">{status.message}</p> : null}
      </div>

      {visible.length === 0 ? <p className="adm-card text-[14px] text-muted">შეკვეთები არ არის.</p> : null}
      <ul className="flex flex-col gap-3">
        {visible.map((o) => {
          const open = openId === o.id;
          return (
            <li key={o.id} className="adm-card p-0">
              <button type="button" onClick={() => setOpenId(open ? null : o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-start">
                <span className="font-mono text-[14px] font-bold">{o.number}</span>
                <span className={cn("px-2 py-0.5 text-[11px] font-bold", STATUS[o.status].className)}>{STATUS[o.status].label}</span>
                <span className="text-[14px]">
                  {o.firstName} {o.lastName}
                </span>
                <span className="text-[13px] text-muted">{new Date(o.createdAt).toLocaleString("ka-GE", { dateStyle: "short", timeStyle: "short" })}</span>
                <span className="ms-auto text-[15px] font-bold">{formatPrice(o.total)}</span>
              </button>
              {open ? (
                <div className="grid gap-5 border-t border-line px-5 py-4 text-[14px] md:grid-cols-2">
                  <div className="space-y-1">
                    <p>
                      <a href={`tel:${o.phone}`} className="font-bold hover:underline">
                        {o.phone}
                      </a>{" "}
                      ·{" "}
                      <a href={`mailto:${o.email}`} className="hover:underline">
                        {o.email}
                      </a>
                    </p>
                    <p>
                      {o.city}, {o.address}
                    </p>
                    <p className="text-muted">
                      გადახდა: {PAYMENT[o.payment]} · ენა: {o.lang.toUpperCase()}
                    </p>
                    {o.note ? <p className="whitespace-pre-line border-s-2 border-blue ps-3">{o.note}</p> : null}
                  </div>
                  <div>
                    <ul className="mb-3 divide-y divide-line border-y border-line">
                      {o.items.map((i) => (
                        <li key={i.variantId} className="flex justify-between gap-3 py-2">
                          <span>
                            {i.name} · {i.label} × {i.quantity}
                          </span>
                          <span className="font-bold">{formatPrice(i.price * i.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <label className="flex items-center gap-2">
                      <span className="adm-label mb-0">სტატუსი</span>
                      <select
                        className="adm-input max-w-[200px]"
                        value={o.status}
                        disabled={pending}
                        onChange={(e) => save(() => setOrderStatus(o.id, e.target.value as OrderStatus))}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS[s].label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
