"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { useCatalog } from "./CatalogProvider";
import { Suspense } from "react";
import { LanguageLinks } from "./LanguageSwitcher";

export function MobileNav({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const { t, href } = useI18n();
  const { categories } = useCatalog();

  const links = [
    { href: href("/coa"), label: t.nav.labResults },
    { href: href("/quality"), label: t.nav.quality },
    { href: href("/shipping"), label: t.nav.shipping },
    { href: href("/wholesale"), label: t.nav.wholesale },
    { href: href("/faq"), label: t.nav.faq },
    { href: href("/about"), label: t.nav.about },
    { href: href("/contact"), label: t.nav.contact },
    { href: href("/account"), label: t.nav.account },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"
      title={t.nav.menu}
      closeLabel={t.common.close}
      className="w-[390px]"
      header={
        <>
          <h2 className="sr-only">{t.nav.menu}</h2>
          <Logo />
        </>
      }
    >
      <div className="flex-1 overflow-auto px-6 py-3">
        <button type="button" onClick={onSearch} className="field mb-2 mt-2 flex items-center gap-3 text-start text-muted">
          <Icon name="search" className="size-5" />
          {t.search.placeholder}
        </button>
        <details className="group border-b border-line" open>
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[21px] font-bold tracking-[-.02em] [&::-webkit-details-marker]:hidden">
            {t.nav.catalog}
            <Icon name="down" className="size-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col pb-3">
            <Link href={href("/products")} onClick={onClose} className="py-2 text-[15px] font-bold">
              {t.nav.allProducts}
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={href(`/category/${c.slug}`)} onClick={onClose} className="flex justify-between py-2 text-[15px] text-muted">
                {c.name}
                <span className="text-[12px]">{c.productCount}</span>
              </Link>
            ))}
          </div>
        </details>
        <nav aria-label={t.nav.menu} className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-line py-4 text-[21px] font-bold tracking-[-.02em]"
            >
              {link.label}
              <Icon name="arrow" className="size-5" />
            </Link>
          ))}
        </nav>
        <div className="pt-6">
          <Suspense>
            <LanguageLinks onNavigate={onClose} />
          </Suspense>
        </div>
        <p className="whitespace-pre-line py-6 text-[13px] leading-relaxed text-muted">{t.nav.mobileNote}</p>
      </div>
    </Modal>
  );
}
