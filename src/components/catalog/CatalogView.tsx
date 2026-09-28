"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import type { CategoryWithCount } from "@/lib/api";
import { useI18n } from "@/i18n/provider";
import { cn, isInStock, minPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { site } from "@/data/site";

const PAGE_SIZE = 12;
const ALL_SORTS = ["featured", "price-asc", "price-desc", "name-asc", "newest"] as const;
type Sort = (typeof ALL_SORTS)[number];
// Price sorting and the price filter only exist while prices are shown (shop mode).
const SORTS: readonly Sort[] = site.shopEnabled ? ALL_SORTS : ALL_SORTS.filter((s) => !s.startsWith("price"));

export type CatalogFilters = {
  categories: string[];
  sizes: string[];
  inStock: boolean;
  min?: number;
  max?: number;
  sort: Sort;
};

function readFilters(params: URLSearchParams): CatalogFilters {
  const list = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const num = (key: string) => {
    const v = Number(params.get(key));
    return params.get(key) && Number.isFinite(v) ? v : undefined;
  };
  const sort = params.get("sort") as Sort;
  return {
    categories: list("category"),
    sizes: list("size"),
    inStock: params.get("stock") === "1",
    min: site.shopEnabled ? num("min") : undefined,
    max: site.shopEnabled ? num("max") : undefined,
    sort: SORTS.includes(sort) ? sort : "featured",
  };
}

function applyFilters(products: Product[], f: CatalogFilters, lockedCategory?: string): Product[] {
  const result = products.filter((p) => {
    if (!lockedCategory && f.categories.length && !f.categories.includes(p.categorySlug)) return false;
    if (f.sizes.length && !p.variants.some((v) => f.sizes.includes(v.label))) return false;
    if (f.inStock && !isInStock(p)) return false;
    const price = minPrice(p);
    if (f.min !== undefined && price < f.min) return false;
    if (f.max !== undefined && price > f.max) return false;
    return true;
  });
  const sorters: Record<Sort, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured),
    "price-asc": (a, b) => minPrice(a) - minPrice(b),
    "price-desc": (a, b) => minPrice(b) - minPrice(a),
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  };
  return result.sort(sorters[f.sort]);
}

function sizeOrder(label: string) {
  const n = parseFloat(label);
  return (label.endsWith("ml") ? 100000 : 0) + n;
}

export function CatalogView({
  products,
  categories,
  lockedCategory,
}: {
  products: Product[];
  categories: CategoryWithCount[];
  lockedCategory?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => readFilters(new URLSearchParams(params.toString())), [params]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [columns, setColumns] = useState<3 | 4>(3);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scope = lockedCategory ? products.filter((p) => p.categorySlug === lockedCategory) : products;
  const results = useMemo(() => applyFilters(scope, filters, lockedCategory), [scope, filters, lockedCategory]);
  const sizes = useMemo(
    () => [...new Set(scope.flatMap((p) => p.variants.map((v) => v.label)))].sort((a, b) => sizeOrder(a) - sizeOrder(b)),
    [scope],
  );

  function update(next: Partial<CatalogFilters>) {
    const merged = { ...filters, ...next };
    const q = new URLSearchParams();
    if (!lockedCategory && merged.categories.length) q.set("category", merged.categories.join(","));
    if (merged.sizes.length) q.set("size", merged.sizes.join(","));
    if (merged.inStock) q.set("stock", "1");
    if (merged.min !== undefined) q.set("min", String(merged.min));
    if (merged.max !== undefined) q.set("max", String(merged.max));
    if (merged.sort !== "featured") q.set("sort", merged.sort);
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setVisible(PAGE_SIZE);
  }
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const clear = () => update({ categories: [], sizes: [], inStock: false, min: undefined, max: undefined });

  const active = [
    ...(lockedCategory ? [] : filters.categories.map((c) => ({ key: `c-${c}`, label: categories.find((x) => x.slug === c)?.name ?? c, remove: () => update({ categories: filters.categories.filter((v) => v !== c) }) }))),
    ...filters.sizes.map((s) => ({ key: `s-${s}`, label: s, remove: () => update({ sizes: filters.sizes.filter((v) => v !== s) }) })),
    ...(filters.inStock ? [{ key: "stock", label: t.catalog.inStockOnly, remove: () => update({ inStock: false }) }] : []),
    ...(filters.min !== undefined ? [{ key: "min", label: `${t.catalog.priceMin} $${filters.min}`, remove: () => update({ min: undefined }) }] : []),
    ...(filters.max !== undefined ? [{ key: "max", label: `${t.catalog.priceMax} $${filters.max}`, remove: () => update({ max: undefined }) }] : []),
  ];

  const filterPanel = (
    <div className="flex flex-col gap-7">
      {!lockedCategory ? (
        <fieldset>
          <legend className="mb-3 text-[13px] font-bold uppercase tracking-[.1em]">{t.catalog.category}</legend>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(c.slug)}
                  onChange={() => update({ categories: toggle(filters.categories, c.slug) })}
                  className="size-4 accent-navy"
                />
                <span className="flex-1">{c.name}</span>
                <span className="text-[12px] text-muted">{c.productCount}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <fieldset>
        <legend className="mb-3 text-[13px] font-bold uppercase tracking-[.1em]">{t.catalog.size}</legend>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filters.sizes.includes(s)}
              onClick={() => update({ sizes: toggle(filters.sizes, s) })}
              className={cn(
                "min-w-[58px] border border-line px-2.5 py-1.5 text-[13px] transition-colors hover:border-navy",
                filters.sizes.includes(s) && "border-navy bg-navy text-white",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-[13px] font-bold uppercase tracking-[.1em]">{t.catalog.availability}</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
          <input type="checkbox" checked={filters.inStock} onChange={(e) => update({ inStock: e.target.checked })} className="size-4 accent-navy" />
          {t.catalog.inStockOnly}
        </label>
      </fieldset>
      {site.shopEnabled ? (
        <fieldset>
        <legend className="mb-3 text-[13px] font-bold uppercase tracking-[.1em]">{t.catalog.price}</legend>
        <form
          key={`${filters.min}-${filters.max}`}
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const parse = (k: string) => (data.get(k) ? Number(data.get(k)) : undefined);
            update({ min: parse("min"), max: parse("max") });
          }}
        >
          <input name="min" type="number" min={0} inputMode="numeric" defaultValue={filters.min} placeholder={t.catalog.priceMin} aria-label={t.catalog.priceMin} className="field min-h-10 px-3 text-[14px]" />
          <span className="text-muted">–</span>
          <input name="max" type="number" min={0} inputMode="numeric" defaultValue={filters.max} placeholder={t.catalog.priceMax} aria-label={t.catalog.priceMax} className="field min-h-10 px-3 text-[14px]" />
          <button type="submit" aria-label={t.catalog.apply} className="grid size-10 shrink-0 place-items-center bg-navy text-white hover:bg-navy-2">
            <Icon name="arrow" className="size-4" />
          </button>
        </form>
        </fieldset>
      ) : null}
      {active.length ? (
        <button type="button" onClick={clear} className="btn btn-ghost min-h-10 text-[13px]">
          {t.catalog.clear}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:gap-10">
      <aside aria-label={t.catalog.filters} className="hidden lg:block">
        <div className="sticky top-[110px]">{filterPanel}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} className="btn btn-ghost min-h-10 px-4 text-[13px] lg:hidden">
              <Icon name="filter" className="size-4" />
              {t.catalog.filters}
              {active.length ? <span className="grid size-5 place-items-center rounded-full bg-navy text-[10px] text-white">{active.length}</span> : null}
            </button>
            <p aria-live="polite" className="text-[14px] text-muted">
              {t.catalog.results(results.length)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="sr-only">
              {t.catalog.sort}
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as Sort })}
              className="field min-h-10 w-auto py-2 pr-8 text-[14px]"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t.catalog.sortOptions[s]}
                </option>
              ))}
            </select>
            <div role="group" aria-label={t.catalog.grid} className="hidden border border-line xl:flex">
              {([3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={columns === n}
                  aria-label={`${t.catalog.grid} ${n}`}
                  onClick={() => setColumns(n)}
                  className={cn("grid size-10 place-items-center transition-colors", columns === n ? "bg-navy text-white" : "hover:bg-ice")}
                >
                  <Icon name={n === 3 ? "grid3" : "grid4"} className="size-[18px]" strokeWidth={1.4} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {active.length ? (
          <ul className="mb-5 flex flex-wrap gap-2">
            {active.map((a) => (
              <li key={a.key}>
                <button type="button" onClick={a.remove} className="flex items-center gap-1.5 bg-ice px-2.5 py-1.5 text-[12px] font-bold transition-colors hover:bg-blue">
                  {a.label}
                  <Icon name="close" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {results.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-16 text-center text-muted">
            <Icon name="search" className="mx-auto mb-5 size-10 text-blue" />
            <h2 className="mb-2 text-[19px] font-bold text-navy">{t.catalog.emptyTitle}</h2>
            <p className="mb-6 text-[14px]">{t.catalog.emptyText}</p>
            <button type="button" onClick={clear} className="btn btn-light">
              {t.catalog.clear}
            </button>
          </div>
        ) : (
          <>
            <div className={cn("grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-3", columns === 4 && "xl:grid-cols-4")}>
              {results.slice(0, visible).map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
            {visible < results.length ? (
              <div className="mt-10 text-center">
                <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn btn-navy">
                  {t.catalog.loadMore} ({results.length - visible})
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} variant="drawer" title={t.catalog.filters} closeLabel={t.common.close} className="w-[360px]">
        <div className="flex-1 overflow-auto px-6 py-6">{filterPanel}</div>
        <div className="shrink-0 border-t border-line bg-mist p-5">
          <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-navy w-full">
            {t.catalog.apply} ({results.length})
          </button>
        </div>
      </Modal>
    </div>
  );
}
