import { cn } from "@/lib/utils";

type Hex = { className: string; opacity?: number };

// Decorative hexagons from the logo. Positions are passed as Tailwind classes.
export function HexPattern({ hexes, className }: { hexes: Hex[]; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {hexes.map((hex, i) => (
        <span key={i} className={cn("hex", hex.className)} style={{ opacity: hex.opacity ?? 0.45 }} />
      ))}
    </div>
  );
}
