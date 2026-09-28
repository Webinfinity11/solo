import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  ice: "bg-ice text-navy",
  navy: "bg-navy text-white",
  outline: "border border-line bg-white text-navy",
  muted: "bg-oos text-white",
  onDark: "border border-blue/30 text-ice",
};

export function Badge({ children, tone = "ice", className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase leading-tight tracking-[.07em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
