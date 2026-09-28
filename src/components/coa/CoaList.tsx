import type { Dictionary } from "@/i18n";
import type { CoaDocument } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export function CoaDownload({ doc, t }: { doc: CoaDocument; t: Dictionary }) {
  if (!doc.fileUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-dashed border-line px-2.5 py-1.5 text-[12px] text-muted" title={t.product.noCoa}>
        <Icon name="file" className="size-4" /> {t.coa.pending}
      </span>
    );
  }
  return (
    <a href={doc.fileUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 bg-navy px-2.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-navy-2">
      <Icon name="download" className="size-4" /> {t.coa.download}
    </a>
  );
}

// Compact COA list for the product page.
export function CoaList({ docs, t, lang }: { docs: CoaDocument[]; t: Dictionary; lang: string }) {
  if (!docs.length) return <p className="text-[15px] text-muted">{t.product.noCoa}</p>;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {docs.map((doc) => (
        <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-mono text-[14px] font-bold">{doc.lot}</p>
            <p className="text-[13px] text-muted">
              {formatDate(doc.testDate, lang)} · {doc.method} · {t.coa.table.purity}: <strong className="text-navy">{doc.purity}</strong>
            </p>
          </div>
          <CoaDownload doc={doc} t={t} />
        </li>
      ))}
    </ul>
  );
}
