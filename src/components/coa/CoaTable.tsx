"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { CoaDocument } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "@/components/layout/CatalogProvider";
import { CoaDownload } from "./CoaList";

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9+]/g, "");

export function CoaTable({ docs }: { docs: CoaDocument[] }) {
  const { t, lang, href } = useI18n();
  const { bySlug, products } = useCatalog();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [product, setProduct] = useState("all");

  const rows = useMemo(() => {
    const q = norm(query);
    return docs.filter((d) => {
      const name = bySlug.get(d.productSlug)?.name ?? d.productSlug;
      return (product === "all" || d.productSlug === product) && (!q || norm(`${d.lot} ${name} ${d.productSlug}`).includes(q));
    });
  }, [docs, query, product, bySlug]);

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_260px]">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute start-4 size-5 text-muted" />
          <label htmlFor="coa-search" className="sr-only">
            {t.coa.search}
          </label>
          <input id="coa-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.coa.search} className="field h-12 ps-12" />
        </div>
        <label htmlFor="coa-product" className="sr-only">
          {t.coa.filterProduct}
        </label>
        <select id="coa-product" value={product} onChange={(e) => setProduct(e.target.value)} className="field h-12">
          <option value="all">{t.coa.allProducts}</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <p aria-live="polite" className="mb-3 text-[13px] text-muted">
        {t.search.results(rows.length)}
      </p>

      {rows.length === 0 ? (
        <div className="border border-dashed border-line px-6 py-14 text-center text-muted">
          <Icon name="file" className="mx-auto mb-4 size-10 text-blue" />
          <p className="text-[15px]">{t.coa.empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[680px] border-collapse text-start text-[14px]">
            <thead className="bg-navy text-white">
              <tr>
                {[t.coa.table.product, t.coa.table.lot, t.coa.table.date, t.coa.table.purity, t.coa.table.method, t.coa.table.file].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-[12px] font-bold uppercase tracking-[.08em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const p = bySlug.get(d.productSlug);
                return (
                  <tr key={d.id} className="border-t border-line odd:bg-white even:bg-mist">
                    <td className="px-4 py-3 font-bold">
                      {p ? (
                        <Link href={href(`/products/${p.slug}`)} className="hover:underline hover:underline-offset-4">
                          {p.name}
                        </Link>
                      ) : (
                        d.productSlug
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px]">{d.lot}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.testDate, lang)}</td>
                    <td className="px-4 py-3 font-bold text-success">{d.purity}</td>
                    <td className="px-4 py-3 text-muted">{d.method}</td>
                    <td className="px-4 py-3">
                      <CoaDownload doc={d} t={t} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
