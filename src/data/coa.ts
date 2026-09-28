// SAMPLE lot records for the layout. Replace with real certificates; set fileUrl
// once the PDF is placed in /public/files/coa (or served by the admin API).
import type { CoaDocument } from "@/lib/types";
import { products } from "./products";

const dates = ["2026-09-12", "2026-08-27", "2026-08-03", "2026-07-15"];
const purities = ["99.4%", "99.2%", "99.6%", "99.1%", "99.3%", "99.5%"];

export const coaDocuments: CoaDocument[] = products.flatMap((product, index) => {
  const lots = product.variants.length > 1 ? 2 : 1;
  return Array.from({ length: lots }, (_, lotIndex) => {
    const n = index * 2 + lotIndex;
    const code = product.slug.replace(/[^a-z0-9]/g, "").slice(0, 4).toUpperCase();
    return {
      id: `coa-${product.slug}-${lotIndex + 1}`,
      productSlug: product.slug,
      lot: `SR-${code}-26${String(9 - lotIndex).padStart(2, "0")}${String(n + 11).padStart(2, "0")}`,
      testDate: dates[(index + lotIndex) % dates.length],
      purity: product.kind === "solution" ? "USP" : purities[n % purities.length],
      method: product.kind === "solution" ? "USP <71>" : "HPLC + MS",
      fileUrl: undefined,
    };
  });
});
