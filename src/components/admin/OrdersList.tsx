"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminOrder } from "@/lib/admin/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/order-status";
import { setOrderStatus } from "@/app/admin/actions";
import { cn, formatPrice } from "@/lib/utils";
import { useSave } from "./ui";

const STATUS: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  new: { label: "ახალი", className: "bg-[#fff4d6] text-[#8a6100]", dot: "bg-[#e0a800]" },
  paid: { label: "გადახდილი", className: "bg-ice text-navy", dot: "bg-[#3b82c4]" },
  shipped: { label: "გაგზავნილი", className: "bg-[#e8e6fb] text-[#4b3fa8]", dot: "bg-[#6b5fd1]" },
  completed: { label: "დასრულებული", className: "bg-[#eaf5ef] text-success", dot: "bg-success" },
  cancelled: { label: "გაუქმებული", className: "bg-mist text-muted", dot: "bg-muted" },
};
const PAYMENT = { bank: "საბანკო გადარიცხვა", cod: "გადახდა კურიერთან" };
const LANG: Record<string, string> = { ka: "ქართული", en: "English", ru: "Русский", ar: "العربية" };

/** What the admin needs to show an order line: photo, site link and editor link. */
export type OrderProductInfo = Record<string, { image?: string; productId: string; slug: string }>;

/** "29.09.2026 14:43" in Tbilisi time; en-GB is available in every runtime, unlike ka-GE. */
function tbilisiTime(iso: string): string {
  return new Date(iso)
    .toLocaleString("en-GB", { timeZone: "Asia/Tbilisi", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    .replace(",", "");
}

export function OrdersList({ orders, products }: { orders: AdminOrder[]; products: OrderProductInfo }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<number | null>(orders[0]?.id ?? null);
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
          const count = o.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <li key={o.id} className={cn("adm-card overflow-hidden p-0", open && "border-navy/40 shadow-[0_8px_24px_-16px_rgba(26,47,66,.5)]")}>
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                aria-expanded={open}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-start hover:bg-mist"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", STATUS[o.status].dot)} aria-hidden="true" />
                <span className="font-mono text-[14px] font-bold">{o.number}</span>
                <span className={cn("px-2 py-0.5 text-[11px] font-bold", STATUS[o.status].className)}>{STATUS[o.status].label}</span>
                <span className="text-[14px] font-bold">
                  {o.firstName} {o.lastName}
                </span>
                <span className="text-[13px] text-muted">{tbilisiTime(o.createdAt)}</span>
                <span className="ms-auto flex items-center gap-4">
                  <span className="text-[13px] text-muted">{count} ც.</span>
                  <span className="text-[16px] font-bold">{formatPrice(o.total)}</span>
                  <span aria-hidden="true" className={cn("text-[12px] text-muted transition-transform", open && "rotate-180")}>
                    ▼
                  </span>
                </span>
              </button>

              {open ? (
                <div className="grid gap-6 border-t border-line bg-[#fbfdff] p-5 lg:grid-cols-[1.4fr_1fr]">
                  {/* Products */}
                  <section>
                    <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[.08em] text-muted">პროდუქცია</h3>
                    <ul className="divide-y divide-line border border-line bg-white">
                      {o.items.map((item) => {
                        const info = products[item.variantId];
                        return (
                          <li key={item.variantId} className="flex items-center gap-4 p-3">
                            <span className="block size-16 shrink-0 overflow-hidden bg-photo">
                              {info?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={info.image} alt="" className="size-full object-cover" />
                              ) : null}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[15px] font-bold">{item.name}</p>
                              <p className="text-[13px] text-muted">
                                {item.label} · {formatPrice(item.price)} × {item.quantity}
                              </p>
                              {info ? (
                                <p className="mt-1 flex flex-wrap gap-x-4 text-[12px] font-bold">
                                  <a href={`/products/${info.slug}`} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">
                                    საიტზე ნახვა ↗
                                  </a>
                                  <Link href={`/admin/products/${info.productId}`} className="text-eyebrow hover:underline">
                                    რედაქტირება
                                  </Link>
                                </p>
                              ) : (
                                <p className="mt-1 text-[12px] text-muted">პროდუქტი აღარ არის კატალოგში</p>
                              )}
                            </div>
                            <span className="text-[15px] font-bold">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        );
                      })}
                      <li className="flex items-center justify-between bg-mist px-3 py-3">
                        <span className="text-[13px] text-muted">მიწოდება: უფასო</span>
                        <span className="text-[17px] font-bold">სულ: {formatPrice(o.total)}</span>
                      </li>
                    </ul>
                  </section>

                  <div className="flex flex-col gap-5">
                    {/* Customer */}
                    <section>
                      <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[.08em] text-muted">მომხმარებელი</h3>
                      <dl className="grid gap-x-4 gap-y-2.5 border border-line bg-white p-4 text-[14px] sm:grid-cols-[110px_1fr]">
                        <dt className="text-muted">სახელი</dt>
                        <dd className="font-bold">
                          {o.firstName} {o.lastName}
                        </dd>
                        <dt className="text-muted">ტელეფონი</dt>
                        <dd>
                          <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="font-bold text-navy hover:underline">
                            {o.phone}
                          </a>
                        </dd>
                        <dt className="text-muted">ელ-ფოსტა</dt>
                        <dd className="break-all">
                          <a href={`mailto:${o.email}?subject=${encodeURIComponent(`შეკვეთა ${o.number}`)}`} className="text-navy hover:underline">
                            {o.email}
                          </a>
                        </dd>
                        <dt className="text-muted">მისამართი</dt>
                        <dd>
                          {o.city}, {o.address}
                        </dd>
                        <dt className="text-muted">გადახდა</dt>
                        <dd>{PAYMENT[o.payment]}</dd>
                        <dt className="text-muted">ენა</dt>
                        <dd>{LANG[o.lang] ?? o.lang}</dd>
                        {o.note ? (
                          <>
                            <dt className="text-muted">კომენტარი</dt>
                            <dd className="whitespace-pre-line border-s-2 border-blue bg-mist px-3 py-2">{o.note}</dd>
                          </>
                        ) : null}
                      </dl>
                    </section>

                    {/* Status */}
                    <section>
                      <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[.08em] text-muted">სტატუსი</h3>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={pending || s === o.status}
                            onClick={() => save(() => setOrderStatus(o.id, s))}
                            aria-pressed={s === o.status}
                            className={cn(
                              "inline-flex items-center gap-2 border px-3 py-2 text-[13px] font-bold transition-colors disabled:cursor-default",
                              s === o.status ? cn(STATUS[s].className, "border-transparent") : "border-line bg-white hover:border-navy",
                            )}
                          >
                            <span className={cn("size-2 rounded-full", STATUS[s].dot)} aria-hidden="true" />
                            {STATUS[s].label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[12px] text-muted">მომხმარებელი სტატუსს თავის კაბინეტში ხედავს.</p>
                    </section>
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
