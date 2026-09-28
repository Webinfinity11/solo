import type { Dictionary } from "@/i18n";

// Mini SOLO hexagon cluster used as the ticker separator.
function HexMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 shrink-0 text-blue">
      <path d="M12 2.5 20.2 7.2v9.6L12 21.5 3.8 16.8V7.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8.2 15.3 10v4L12 15.8 8.7 14v-4Z" fill="currentColor" />
    </svg>
  );
}

// Infinite marquee: the track slides by -50% and loops seamlessly.
export function AnnouncementBar({ t }: { t: Dictionary }) {
  const group = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {t.ticker.map((item) => (
        <li key={item} className="flex items-center gap-5 pr-5 sm:gap-7 sm:pr-7">
          <HexMark />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="group relative flex h-9 items-center overflow-hidden bg-[#0f1d2a] text-white" role="region" aria-label="SOLO Research">
      <div className="flex w-max animate-marquee whitespace-nowrap text-[11px] font-bold uppercase tracking-[.14em] group-hover:[animation-play-state:paused]">
        {/* Four copies so one half is wider than any screen; the track shifts by exactly one half. */}
        {group(false)}
        {group(true)}
        {group(true)}
        {group(true)}
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0f1d2a] to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0f1d2a] to-transparent" />
    </div>
  );
}
