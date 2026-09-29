import Link from "next/link";
import { getContentFresh } from "@/lib/content/store";
import { PageTitle } from "@/components/admin/ui";
import { getAdminCounts, getOrders } from "@/lib/admin/orders";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { formatPrice } from "@/lib/utils";

export default async function AdminHome() {
  const [content, counts, orders] = await Promise.all([
    getContentFresh(),
    getAdminCounts().catch(() => ({ newOrders: 0, pendingReviews: 0 })),
    getOrders().catch(() => []),
  ]);
  const fresh = orders.filter((o) => o.status === "new").slice(0, 6);
  const active = content.products.filter((p) => p.status === "active").length;
  const cards = [
    { href: "/admin/orders", title: "ახალი შეკვეთები", value: `${counts.newOrders}`, note: `სულ ${orders.length} შეკვეთა` },
    { href: "/admin/reviews", title: "შეფასებები მოლოდინში", value: `${counts.pendingReviews}`, note: "დასამტკიცებელი" },
    { href: "/admin/products", title: "პროდუქცია", value: `${content.products.length}`, note: `${active} აქტიური` },
    { href: "/admin/categories", title: "კატეგორიები", value: `${content.categories.length}` },
    { href: "/admin/coa", title: "COA სერტიფიკატები", value: `${content.coa.length}`, note: `${content.coa.filter((d) => d.fileUrl).length} PDF-ით` },
    { href: "/admin/faq", title: "FAQ კითხვები", value: `${content.faq.ka.items.length}` },
    { href: "/admin/texts", title: "გვერდების ტექსტები", value: `${Object.keys(content.texts.ka).length}`, note: "შეცვლილი ველი (ქართ.)" },
    { href: "/admin/settings", title: "კონტაქტი და ფუტერი", value: content.settings.email },
  ];

  return (
    <>
      <PageTitle title="მოგესალმებით" description="აირჩიეთ, რისი რედაქტირება გსურთ. შენახული ცვლილებები საიტზე რამდენიმე წამში გამოჩნდება." />
      <AutoRefresh />
      {fresh.length ? (
        <section className="adm-card mb-6 border-[#e0a800]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold">
              ახალი შეკვეთები <span className="ms-1 rounded-full bg-[#e0a800] px-2 text-[12px] text-navy">{counts.newOrders}</span>
            </h2>
            <Link href="/admin/orders" className="text-[13px] font-bold hover:underline">
              ყველა შეკვეთა →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {fresh.map((o) => (
              <li key={o.id}>
                <Link href="/admin/orders" className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[14px] hover:bg-mist">
                  <span className="font-mono font-bold">{o.number}</span>
                  <span>
                    {o.firstName} {o.lastName}
                  </span>
                  <span className="text-muted">{o.phone}</span>
                  <span className="text-muted">{o.payment === "bank" ? "გადარიცხვა" : "კურიერთან"}</span>
                  <span className="ms-auto font-bold">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="adm-card transition-colors hover:border-navy">
            <p className="mb-2 text-[13px] font-bold text-muted">{c.title}</p>
            <p className="truncate text-[26px] font-bold leading-tight">{c.value}</p>
            {c.note ? <p className="mt-1 text-[13px] text-muted">{c.note}</p> : null}
          </Link>
        ))}
      </div>
    </>
  );
}
