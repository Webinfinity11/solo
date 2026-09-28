"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, splitLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { HexPattern } from "@/components/brand/HexPattern";
import { Icon } from "@/components/ui/Icon";

// not-found receives no params, so the language is read from the URL.
export default function NotFound() {
  const { lang } = splitLocale(usePathname() ?? "/");
  const t = getDictionary(lang);
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-24 text-center">
      <HexPattern
        hexes={[
          { className: "left-[-3%] top-10 h-[178px] w-[158px]", opacity: 0.5 },
          { className: "right-[-5%] top-8 h-[318px] w-[277px]", opacity: 0.35 },
        ]}
      />
      <div className="container-site">
        <p className="mb-3 text-[88px] font-bold leading-none tracking-[-.05em] text-blue">404</p>
        <h1 className="mb-3 text-[30px] font-bold tracking-[-.03em]">{t.notFound.title}</h1>
        <p className="mb-8 text-[15px] text-muted">{t.notFound.text}</p>
        <Link href={localePath(lang, "/")} className="btn btn-navy">
          {t.notFound.cta} <Icon name="arrow" className="size-[18px]" />
        </Link>
      </div>
    </section>
  );
}
