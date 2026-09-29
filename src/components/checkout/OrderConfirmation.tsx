"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import type { SiteSettings } from "@/lib/content/types";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export function OrderConfirmation({ bank }: { bank: SiteSettings["bank"] }) {
  const { t, href } = useI18n();
  const c = t.checkout;
  const params = useSearchParams();
  const number = params.get("order");
  const isBank = params.get("pay") === "bank";
  const total = Number(params.get("total"));

  const rows: [string, string][] = [
    [c.bank.recipient, bank.recipient],
    [c.bank.bankName, bank.bankName],
    [c.bank.iban, bank.iban],
    [c.bank.amount, Number.isFinite(total) && total > 0 ? formatPrice(total) : ""],
    [c.bank.reference, number ?? ""],
  ];

  return (
    <>
      {number ? (
        <p className="mb-4 text-[15px]">
          {c.orderNumber}: <strong className="font-mono text-[17px]">{number}</strong>
        </p>
      ) : null}
      <p className="mb-6 text-[15px] leading-relaxed text-muted">{isBank ? c.successBank : c.successCod}</p>

      {isBank ? (
        <dl className="mb-8 border border-line bg-white p-5 text-start text-[14px]">
          <p className="mb-3 text-[16px] font-bold">{c.bank.title}</p>
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-t border-line py-2.5">
                <dt className="text-muted">{label}</dt>
                <dd className="break-all font-bold">{value}</dd>
              </div>
            ))}
        </dl>
      ) : null}

      <Link href={href("/products")} className="btn btn-navy">
        {c.successCta} <Icon name="arrow" className="size-[18px]" />
      </Link>
    </>
  );
}
