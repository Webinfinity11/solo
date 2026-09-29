import Link from "next/link";
import { getContentFresh } from "@/lib/content/store";
import { PageTitle } from "@/components/admin/ui";

export default async function AdminHome() {
  const content = await getContentFresh();
  const active = content.products.filter((p) => p.status === "active").length;
  const cards = [
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
