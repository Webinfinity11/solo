import type { ReactNode } from "react";
import { HexPattern } from "@/components/brand/HexPattern";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { mtavruli } from "@/lib/utils";

// Light page header used by inner pages.
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--blue-light),#f6fbff_51%,var(--blue-light))] py-10 sm:py-14">
      <HexPattern
        hexes={[
          { className: "end-[-4%] top-[-30px] h-[230px] w-[200px]", opacity: 0.35 },
          { className: "end-[14%] bottom-[-40px] h-[99px] w-[87px] max-sm:hidden", opacity: 0.4 },
        ]}
      />
      <div className="container-site relative">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        {eyebrow ? <p className="eyebrow mb-2">{mtavruli(eyebrow)}</p> : null}
        <h1 className="max-w-3xl text-[32px] font-bold leading-[1.12] tracking-[-.035em] text-balance sm:text-[44px]">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}
