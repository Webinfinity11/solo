import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

// Native <details> accordion, styled after the design preview FAQ.
export function Accordion({ items, className }: { items: { question: string; answer: ReactNode }[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item, i) => (
        <details key={i} className="group border border-blue/25 bg-white/95">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 px-4 py-4 text-[14px] font-bold leading-snug group-open:text-[#41688b] sm:px-5 [&::-webkit-details-marker]:hidden">
            {item.question}
            <Icon name="plus" className="size-[17px] transition-transform group-open:rotate-45" />
          </summary>
          <div className="max-w-[690px] px-4 pb-5 pe-7 text-[14px] leading-[1.75] text-muted sm:px-5 sm:pe-12">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
