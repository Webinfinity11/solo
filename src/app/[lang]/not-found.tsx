"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { HexPattern } from "@/components/brand/HexPattern";
import { Icon } from "@/components/ui/Icon";

// Rendered inside the [lang] layout, so language and texts come from the provider.
export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-24 text-center">
      <HexPattern
        hexes={[
          { className: "start-[-3%] top-10 h-[178px] w-[158px]", opacity: 0.5 },
          { className: "end-[-5%] top-8 h-[318px] w-[277px]", opacity: 0.35 },
        ]}
      />
      <div className="container-site">
        <p className="mb-3 text-[88px] font-bold leading-none tracking-[-.05em] text-blue">404</p>
        <h1 className="mb-3 text-[30px] font-bold tracking-[-.03em]">{t.notFound.title}</h1>
        <p className="mb-8 text-[15px] text-muted">{t.notFound.text}</p>
        <Link href={href("/")} className="btn btn-navy">
          {t.notFound.cta} <Icon name="arrow" className="size-[18px]" />
        </Link>
      </div>
    </section>
  );
}
