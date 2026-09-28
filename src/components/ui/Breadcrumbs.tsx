import Link from "next/link";
import { Icon } from "./Icon";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <Icon name="right" className="size-3.5 text-eyebrow" /> : null}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-navy">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-bold text-navy">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
