"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { cn, formatPrice, minPrice } from "@/lib/utils";
import { site } from "@/data/site";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/brand/ProductImage";
import { useCatalog } from "./CatalogProvider";

const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9ა-ჿ+]/g, "");

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, href } = useI18n();
  const { products, categories } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const results = useMemo(() => {
    const q = normalize(query);
    return products.filter(
      (p) => (category === "all" || p.categorySlug === category) && normalize(`${p.name} ${p.slug} ${p.shortDescription}`).includes(q),
    );
  }, [products, query, category]);

  function reset() {
    setQuery("");
    setCategory("all");
  }

  return (
    <Modal open={open} onClose={onClose} eyebrow={t.search.eyebrow} title={t.search.title} closeLabel={t.common.close} className="w-[850px]">
      <div className="border-b border-line px-5 pb-4 pt-5 sm:px-7">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-4 size-5 text-muted" />
          <label htmlFor="site-search" className="sr-only">
            {t.search.placeholder}
          </label>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            autoComplete="off"
            className="field h-12 pl-12"
          />
        </div>
        <div role="group" aria-label={t.catalog.category} className="mt-4 flex flex-wrap gap-2">
          {[{ slug: "all", name: t.search.all }, ...categories].map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={category === c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-sm border border-line bg-white px-3 py-1.5 text-[12px] transition-colors hover:border-blue",
                category === c.slug && "border-navy bg-navy text-white hover:border-navy",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
        <output aria-live="polite" className="mt-3 block text-[12px] text-muted">
          {t.search.results(results.length)}
        </output>
      </div>
      <div className="flex flex-col px-5 pb-6 pt-1 sm:px-7">
        {results.length === 0 ? (
          <div className="px-5 py-14 text-center text-muted">
            <Icon name="search" className="mx-auto mb-5 size-10 text-blue" />
            <h3 className="mb-2 text-[19px] font-bold text-navy">{t.search.emptyTitle}</h3>
            <p className="mb-5 text-[14px]">{t.search.emptyText}</p>
            <button type="button" onClick={reset} className="btn btn-light">
              {t.catalog.clear}
            </button>
          </div>
        ) : (
          results.map((p) => (
            <Link
              key={p.id}
              href={href(`/products/${p.slug}`)}
              onClick={onClose}
              className="flex min-h-[88px] items-center gap-4 border-b border-line px-1 py-3 text-left transition-colors hover:bg-mist"
            >
              <span className="block h-[68px] w-[62px] shrink-0">
                <ProductImage name={p.name} src={p.images[0]} sizes="70px" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="mb-1 block text-[15px]">{p.name}</strong>
                <small className="block truncate text-[12px] text-muted">
                  {p.variants.map((v) => v.label).join(" · ")}
                  {site.shopEnabled ? ` · ${t.common.fromPrice(formatPrice(minPrice(p)))}` : null}
                </small>
              </span>
              <Icon name="arrow" className="mr-2 size-[18px]" />
            </Link>
          ))
        )}
      </div>
    </Modal>
  );
}
