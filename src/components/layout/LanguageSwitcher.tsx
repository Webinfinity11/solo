"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeMeta, localePath, splitLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/** Same page in another language, keeping the query string. */
function useLocaleHref() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { path } = splitLocale(pathname);
  return (lang: (typeof locales)[number]) => localePath(lang, path) + (search ? `?${search}` : "");
}

// Header dropdown: current language code, list of the languages.
export function LanguageSwitcher() {
  const { lang } = useI18n();
  const hrefFor = useLocaleHref();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={localeMeta[lang].label}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1 rounded-sm px-2 text-[13px] font-bold transition-colors hover:bg-ice"
      >
        <Icon name="globe" className="size-[18px]" />
        {localeMeta[lang].short}
        <Icon name="down" className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <ul
        className={cn(
          "absolute end-0 top-full z-40 mt-1 w-[160px] border border-line bg-white p-1.5 shadow-[0_24px_60px_-30px_rgba(26,47,66,.45)] transition",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        {locales.map((l) => (
          <li key={l}>
            <Link
              href={hrefFor(l)}
              hrefLang={localeMeta[l].htmlLang}
              aria-current={l === lang ? "true" : undefined}
              onClick={() => setOpen(false)}
              className={cn("flex items-center justify-between px-3 py-2 text-[14px] transition-colors hover:bg-ice", l === lang && "font-bold")}
            >
              {localeMeta[l].label}
              <span className="text-[11px] text-muted">{localeMeta[l].short}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Inline list for the mobile menu and the age gate (`full` shows language names).
export function LanguageLinks({ onNavigate, full, className }: { onNavigate?: () => void; full?: boolean; className?: string }) {
  const { lang } = useI18n();
  const hrefFor = useLocaleHref();
  return (
    <div className={cn("flex gap-2", className)}>
      {locales.map((l) => (
        <Link
          key={l}
          href={hrefFor(l)}
          hrefLang={localeMeta[l].htmlLang}
          onClick={onNavigate}
          aria-current={l === lang ? "true" : undefined}
          className={cn(
            "flex-1 border px-3 py-2.5 text-center text-[13px] font-bold transition-colors",
            full && "px-2 py-2 text-[12px] sm:text-[13px]",
            l === lang ? "border-navy bg-navy text-white" : "border-line hover:border-navy",
          )}
        >
          {full ? localeMeta[l].label : localeMeta[l].short}
        </Link>
      ))}
    </div>
  );
}
