import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  dark,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  id?: string;
}) {
  const center = align === "center";
  return (
    <div className={cn("mb-7 flex gap-5", center ? "flex-col items-center text-center" : "flex-wrap items-end justify-between", className)}>
      <div className={cn(center && "max-w-2xl")}>
        {eyebrow ? <p className={cn("eyebrow mb-1.5", dark && "text-blue")}>{eyebrow}</p> : null}
        <h2 id={id} className="text-[28px] font-bold leading-[1.15] tracking-[-.03em] text-balance sm:text-[32px]">
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-3 max-w-2xl text-[15px] leading-relaxed", dark ? "text-white/80" : "text-muted", center && "mx-auto")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
