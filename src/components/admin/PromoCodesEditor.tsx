"use client";

import { useState } from "react";
import type { AdminPromo } from "@/lib/admin/promo";
import { addPromoPayout, deletePromoCode, deletePromoPayout, savePromoCode } from "@/app/admin/actions";
import { cn, formatPrice } from "@/lib/utils";
import { Checkbox, NumberInput, Section, TextInput, useSave } from "./ui";

type Draft = { id?: number; code: string; owner: string; contact: string; discountPercent: number | undefined; commissionPercent: number | undefined; active: boolean };

const EMPTY: Draft = { code: "", owner: "", contact: "", discountPercent: 10, commissionPercent: 20, active: true };
const STATUS_LABEL: Record<string, string> = { new: "ახალი", paid: "გადახდილი", shipped: "გაგზავნილი", completed: "დასრულებული", cancelled: "გაუქმებული" };

function date(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { timeZone: "Asia/Tbilisi" }).replace(/\//g, ".");
}

function Status({ status }: { status: { ok: boolean; message: string } | null }) {
  return status ? <p className={cn("text-[13px] font-bold", status.ok ? "text-success" : "text-danger")}>{status.message}</p> : null;
}

function PromoForm({ initial, onDone, submitLabel }: { initial: Draft; onDone?: () => void; submitLabel: string }) {
  const [d, setD] = useState<Draft>(initial);
  const { save, pending, status } = useSave();
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextInput label="კოდი" value={d.code} onChange={(code) => set({ code: code.toUpperCase() })} placeholder="მაგ.: NINO10" className="font-mono" />
        <TextInput label="კრეატორი" value={d.owner} onChange={(owner) => set({ owner })} placeholder="სახელი / გვერდის სახელი" />
        <TextInput label="კონტაქტი" value={d.contact} onChange={(contact) => set({ contact })} placeholder="ტელეფონი, Instagram…" />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="ფასდაკლება %" value={d.discountPercent} onChange={(discountPercent) => set({ discountPercent })} />
          <NumberInput label="საკომისიო %" value={d.commissionPercent} onChange={(commissionPercent) => set({ commissionPercent })} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox label="აქტიური (საიტზე მუშაობს)" checked={d.active} onChange={(active) => set({ active })} />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            save(
              () => savePromoCode({ ...d, discountPercent: d.discountPercent ?? 0, commissionPercent: d.commissionPercent ?? 0 }),
              () => {
                if (!d.id) setD(EMPTY);
                onDone?.();
              },
            )
          }
          className="adm-btn adm-btn-primary"
        >
          {pending ? "ინახება…" : submitLabel}
        </button>
        <Status status={status} />
      </div>
    </div>
  );
}

function PayoutForm({ promo }: { promo: AdminPromo }) {
  const balance = Math.max(0, Math.round((promo.earned - promo.paidOut) * 100) / 100);
  const [amount, setAmount] = useState<number | undefined>(balance || undefined);
  const [note, setNote] = useState("");
  const { save, pending, status } = useSave();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <NumberInput label="გადახდილი თანხა ₾" value={amount} onChange={setAmount} className="w-40" />
      <TextInput label="შენიშვნა" value={note} onChange={setNote} placeholder="მაგ.: გადარიცხვა TBC" className="min-w-[200px] flex-1" />
      <button
        type="button"
        disabled={pending || !amount}
        onClick={() =>
          save(
            () => addPromoPayout(promo.id, amount ?? 0, note),
            () => setNote(""),
          )
        }
        className="adm-btn adm-btn-primary"
      >
        გადახდის ჩაწერა
      </button>
      <Status status={status} />
    </div>
  );
}

function PromoCard({ promo, siteUrl }: { promo: AdminPromo; siteUrl: string }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { save, pending, status } = useSave();
  const balance = Math.round((promo.earned - promo.paidOut) * 100) / 100;
  const link = `${siteUrl}/?promo=${promo.code}`;
  const live = promo.orders.filter((o) => o.status !== "cancelled").length;

  return (
    <li className={cn("adm-card overflow-hidden p-0", !promo.active && "opacity-70")}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-start hover:bg-mist">
        <span className="font-mono text-[16px] font-bold tracking-wide">{promo.code}</span>
        <span className={cn("px-2 py-0.5 text-[11px] font-bold", promo.active ? "bg-[#eaf5ef] text-success" : "bg-mist text-muted")}>{promo.active ? "აქტიური" : "გამორთული"}</span>
        <span className="text-[14px] font-bold">{promo.owner}</span>
        <span className="text-[13px] text-muted">
          -{promo.discountPercent}% მყიდველს · {promo.commissionPercent}% კრეატორს
        </span>
        <span className="ms-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
          <span className="text-muted">{live} შეკვეთა</span>
          <span>
            ნაშოვნი <strong>{formatPrice(promo.earned)}</strong>
          </span>
          <span className={cn("font-bold", balance > 0 ? "text-[#8a6100]" : "text-muted")}>გადასახდელი {formatPrice(balance)}</span>
          <span aria-hidden="true" className={cn("text-[12px] text-muted transition-transform", open && "rotate-180")}>
            ▼
          </span>
        </span>
      </button>

      {open ? (
        <div className="grid gap-6 border-t border-line bg-[#fbfdff] p-5">
          <dl className="grid gap-3 text-[14px] sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["გაყიდვები (დასრულებული)", formatPrice(promo.sales)],
              ["ნაშოვნი საკომისიო", formatPrice(promo.earned)],
              ["მოლოდინში (დაუსრულებელი)", formatPrice(promo.pending)],
              ["უკვე გადახდილი", formatPrice(promo.paidOut)],
              ["გადასახდელი", formatPrice(balance)],
            ].map(([label, value]) => (
              <div key={label} className="border border-line bg-white p-3">
                <dt className="text-[12px] text-muted">{label}</dt>
                <dd className="text-[18px] font-bold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-3 text-[13px]">
            <span className="text-muted">ბმული კრეატორისთვის (კოდს ავტომატურად იყენებს):</span>
            <code className="border border-line bg-white px-2 py-1">{link}</code>
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                void navigator.clipboard?.writeText(link).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              {copied ? "დაკოპირდა ✓" : "კოპირება"}
            </button>
            {promo.contact ? <span className="text-muted">კონტაქტი: {promo.contact}</span> : null}
          </div>

          <section>
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[.08em] text-muted">შეკვეთები ამ კოდით</h3>
            {promo.orders.length ? (
              <div className="overflow-x-auto border border-line bg-white">
                <table className="w-full text-[13px]">
                  <thead className="bg-mist text-start text-muted">
                    <tr>
                      <th className="px-3 py-2 text-start font-bold">შეკვეთა</th>
                      <th className="px-3 py-2 text-start font-bold">თარიღი</th>
                      <th className="px-3 py-2 text-start font-bold">სტატუსი</th>
                      <th className="px-3 py-2 text-end font-bold">გადაიხადა</th>
                      <th className="px-3 py-2 text-end font-bold">საკომისიო</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {promo.orders.map((o) => (
                      <tr key={o.number} className={cn(o.status === "cancelled" && "text-muted line-through")}>
                        <td className="px-3 py-2 font-mono font-bold">{o.number}</td>
                        <td className="px-3 py-2">{date(o.createdAt)}</td>
                        <td className="px-3 py-2">{STATUS_LABEL[o.status] ?? o.status}</td>
                        <td className="px-3 py-2 text-end">{formatPrice(o.total)}</td>
                        <td className={cn("px-3 py-2 text-end font-bold", o.status === "completed" ? "text-success" : "text-muted")}>{formatPrice(o.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[13px] text-muted">ამ კოდით ჯერ არავის უყიდია.</p>
            )}
            <p className="mt-2 text-[12px] text-muted">საკომისიო ითვლება მხოლოდ „დასრულებულ“ შეკვეთებზე; გაუქმებულზე არ ითვლება.</p>
          </section>

          <section>
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[.08em] text-muted">კრეატორისთვის გადახდები</h3>
            {promo.payouts.length ? (
              <ul className="mb-4 divide-y divide-line border border-line bg-white text-[13px]">
                {promo.payouts.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-4 px-3 py-2">
                    <span>{date(p.createdAt)}</span>
                    <strong>{formatPrice(p.amount)}</strong>
                    <span className="flex-1 text-muted">{p.note}</span>
                    <button type="button" disabled={pending} onClick={() => save(() => deletePromoPayout(p.id))} className="text-[12px] text-muted hover:text-danger">
                      წაშლა
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <PayoutForm promo={promo} />
          </section>

          <section className="border-t border-line pt-5">
            {editing ? (
              <PromoForm initial={{ ...promo }} submitLabel="ცვლილებების შენახვა" onDone={() => setEditing(false)} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setEditing(true)} className="adm-btn">
                  რედაქტირება
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => save(() => savePromoCode({ ...promo, active: !promo.active }))}
                  className="adm-btn"
                >
                  {promo.active ? "გამორთვა" : "ჩართვა"}
                </button>
                {promo.orders.length === 0 ? (
                  <button type="button" disabled={pending} onClick={() => save(() => deletePromoCode(promo.id))} className="adm-btn text-danger">
                    წაშლა
                  </button>
                ) : null}
                <Status status={status} />
              </div>
            )}
          </section>
        </div>
      ) : null}
    </li>
  );
}

export function PromoCodesEditor({ promos, siteUrl }: { promos: AdminPromo[]; siteUrl: string }) {
  const toPay = promos.reduce((s, p) => s + Math.max(0, p.earned - p.paidOut), 0);
  const pending = promos.reduce((s, p) => s + p.pending, 0);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="adm-card">
          <p className="text-[13px] text-muted">აქტიური კოდები</p>
          <p className="text-[26px] font-bold">{promos.filter((p) => p.active).length}</p>
        </div>
        <div className="adm-card">
          <p className="text-[13px] text-muted">კრეატორებისთვის გადასახდელი</p>
          <p className="text-[26px] font-bold">{formatPrice(Math.round(toPay * 100) / 100)}</p>
        </div>
        <div className="adm-card">
          <p className="text-[13px] text-muted">მოლოდინში (დაუსრულებელი შეკვეთები)</p>
          <p className="text-[26px] font-bold">{formatPrice(Math.round(pending * 100) / 100)}</p>
        </div>
      </div>

      <Section title="ახალი პრომო კოდი">
        <PromoForm initial={EMPTY} submitLabel="კოდის დამატება" />
      </Section>

      {promos.length ? (
        <ul className="flex flex-col gap-3">
          {promos.map((p) => (
            <PromoCard key={p.id} promo={p} siteUrl={siteUrl} />
          ))}
        </ul>
      ) : (
        <p className="adm-card text-[14px] text-muted">კოდები ჯერ არ არის. დაამატეთ პირველი ზემოთ.</p>
      )}
    </div>
  );
}
