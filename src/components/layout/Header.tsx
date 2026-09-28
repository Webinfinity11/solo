"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useCart, cartCount } from "@/lib/cart-store";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./CatalogProvider";
import { SearchDialog } from "./SearchDialog";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { t, href } = useI18n();
  const { categories } = useCatalog();
  const pathname = usePathname();
  const count = useCart((s) => cartCount(s.items));
  const openCart = useCart((s) => s.openDrawer);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCatalogOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!catalogOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setCatalogOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCatalogOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [catalogOpen]);

  const links = [
    { href: href("/coa"), label: t.nav.labResults },
    { href: href("/quality"), label: t.nav.quality },
    { href: href("/shipping"), label: t.nav.shipping },
    { href: href("/wholesale"), label: t.nav.wholesale },
    { href: href("/faq"), label: t.nav.faq },
  ];
  const isActive = (link: string) => pathname === link || pathname.startsWith(`${link}/`);
  const catalogActive = isActive(href("/products")) || isActive(href("/category"));

  const navLink = "relative flex items-center text-[13px] font-bold after:absolute after:bottom-6 after:left-0 after:right-full after:h-0.5 after:bg-navy after:transition-[right] after:duration-200 hover:after:right-0";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/97 backdrop-blur-lg">
        <div className="container-site flex h-[76px] items-center justify-between gap-6 lg:h-[88px]">
          <Link href={href("/")} aria-label="SOLO Research" className="shrink-0">
            <Logo priority />
          </Link>

          <nav aria-label={t.nav.menu} className="hidden self-stretch lg:flex lg:items-stretch lg:gap-6 xl:gap-8">
            <div ref={dropdownRef} className="group relative flex items-stretch">
              <button
                type="button"
                aria-expanded={catalogOpen}
                aria-haspopup="true"
                onClick={() => setCatalogOpen((v) => !v)}
                className={cn(navLink, "gap-1", catalogActive && "after:right-0")}
              >
                {t.nav.catalog}
                <Icon name="down" className={cn("size-4 transition-transform", catalogOpen && "rotate-180")} />
              </button>
              <div
                className={cn(
                  "absolute left-[-24px] top-full w-[320px] border border-line bg-white p-3 shadow-[0_24px_60px_-30px_rgba(26,47,66,.45)] transition",
                  catalogOpen ? "visible opacity-100" : "invisible opacity-0 group-hover:visible group-hover:opacity-100",
                )}
              >
                <Link
                  href={href("/products")}
                  className="mb-1 flex items-center justify-between bg-navy px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-navy-2"
                >
                  {t.nav.allProducts}
                  <Icon name="arrow" className="size-4" />
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={href(`/category/${c.slug}`)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px] transition-colors hover:bg-ice"
                  >
                    <span>{c.name}</span>
                    <span className="text-[12px] text-muted">{c.productCount}</span>
                  </Link>
                ))}
              </div>
            </div>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(navLink, isActive(link.href) && "after:right-0")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label={t.nav.search} className="grid h-10 w-10 place-items-center rounded-sm transition-colors hover:bg-ice">
              <Icon name="search" />
            </button>
            <Link href={href("/account")} aria-label={t.nav.account} className="hidden h-10 w-10 place-items-center rounded-sm transition-colors hover:bg-ice sm:grid">
              <Icon name="user" />
            </Link>
            {site.shopEnabled ? (
              <button
                type="button"
                onClick={openCart}
                aria-label={`${t.nav.cart}: ${count}`}
                className="relative grid h-10 w-10 place-items-center rounded-sm transition-colors hover:bg-ice"
              >
                <Icon name="cart" />
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-white bg-navy px-1 text-[9px] font-bold leading-none text-white"
                >
                  {count}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-haspopup="dialog"
              className="grid h-10 w-10 place-items-center rounded-sm transition-colors hover:bg-ice lg:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />
    </>
  );
}
