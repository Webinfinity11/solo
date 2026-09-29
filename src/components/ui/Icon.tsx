import { cn } from "@/lib/utils";

// Stroke icons from the design preview sprite, plus a few brand extras.
const paths = {
  search: <><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.5 4.5" /></>,
  user: <><circle cx="12" cy="7.5" r="3.6" /><path d="M4.8 21v-2.3a7.2 7.2 0 0 1 14.4 0V21" /></>,
  cart: <><path d="M2 3h2.5l2.2 12.1h12.4l2.1-8.5H5.2" /><path d="M8 11.7h10.7" /><circle cx="8.2" cy="20" r="1.1" /><circle cx="18.3" cy="20" r="1.1" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  down: <path d="m7 10 5 5 5-5" />,
  right: <path d="m10 7 5 5-5 5" />,
  plus: <path d="M5 12h14M12 5v14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  truck: <><path d="M1.5 5h12v12h-3m-5 0h-4V5Zm12 5h5l4 4v3h-3m-3 0h-3" /><circle cx="8" cy="18" r="2.3" /><circle cx="18.2" cy="18" r="2.3" /></>,
  shield: <path d="M12 2.2c2.2 2.1 5 3.2 8 3.5v6.1c0 5-3.3 8.3-8 10-4.7-1.7-8-5-8-10V5.7c3-.3 5.8-1.4 8-3.5Z" />,
  flask: <path d="M8.7 2.5h6.6M10 2.5v6.2L3.7 19.1a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L14 8.7V2.5M7 15.5h10" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></>,
  file: <path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h8" />,
  box: <path d="m12 2 10 5v10l-10 5-10-5V7l10-5Zm0 10v10M2 7l10 5 10-5M7 4.5l10 5V14" />,
  dna: <path d="M7 2c0 5 10 5 10 10S7 17 7 22M17 2c0 5-10 5-10 10s10 5 10 10M8.5 5h7M8.5 19h7M10 9.2h4M10 14.8h4" />,
  snowflake: <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5M3.5 10.5l3.4-1.2L6.2 6M20.5 13.5l-3.4 1.2.7 3.3M3.5 13.5l3.4 1.2-.7 3.3M20.5 10.5l-3.4-1.2.7-3.3" />,
  hex: <path d="m12 2 8.7 5v10L12 22l-8.7-5V7L12 2Z" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  brain: <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5 3 3 0 0 0 4 4 3 3 0 0 0 3-1V4a3 3 0 0 0-3-1Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 5 3 3 0 0 1-4 4 3 3 0 0 1-3-1" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  heart: <path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20Z" />,
  growth: <path d="M3 20h18M6 16l4-5 3 3 5-7m0 0h-4m4 0v4" />,
  drop: <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />,
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  grid3: <path d="M3 3h5v5H3zM10 3h4v5h-4zM16 3h5v5h-5zM3 10h5v4H3zM10 10h4v4h-4zM16 10h5v4h-5zM3 16h5v5H3zM10 16h4v5h-4zM16 16h5v5h-5z" />,
  grid4: <path d="M3 3h3.5v3.5H3zM8.5 3H12v3.5H8.5zM14 3h3.5v3.5H14zM19.5 3H21v3.5h-1.5zM3 8.5h3.5V12H3zM8.5 8.5H12V12H8.5zM14 8.5h3.5V12H14zM3 14h3.5v3.5H3zM8.5 14H12v3.5H8.5zM14 14h3.5v3.5H14z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 20h16" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />,
} as const;

export type IconName = keyof typeof paths;

// Icons that point "forward" mirror in right-to-left languages.
const directional: ReadonlySet<IconName> = new Set(["arrow", "right"]);

export function Icon({ name, className, strokeWidth = 1.7 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-[22px] shrink-0", directional.has(name) && "rtl:-scale-x-100", className)}
    >
      {paths[name]}
    </svg>
  );
}
