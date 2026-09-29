"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { LanguageLinks } from "./LanguageSwitcher";

const COOKIE = "solo_age_ok";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function AgeGate() {
  const { t, href } = useI18n();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c === `${COOKIE}=1`)) setOpen(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function accept() {
    document.cookie = `${COOKIE}=1; max-age=${MAX_AGE}; path=/; samesite=lax`;
    setOpen(false);
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-title" className="fixed inset-0 z-[100] grid place-items-center overflow-auto bg-navy/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-[520px] overflow-hidden border border-line bg-white text-center shadow-[0_24px_100px_rgba(0,18,32,.4)] animate-dialog-in">
        <span aria-hidden="true" className="hex -end-10 -top-12 h-[150px] w-[130px] opacity-40" />
        <span aria-hidden="true" className="hex -bottom-10 -start-8 h-[99px] w-[87px] opacity-30" />
        <div className="relative px-6 py-8 sm:px-10">
          {/* Switching language reloads the page in that language, with the gate still open. */}
          <Suspense>
            <LanguageLinks full className="mb-7" />
          </Suspense>
          <Logo className="mx-auto mb-6" />
          {exited ? (
            <p className="text-[15px] leading-relaxed text-muted">{t.ageGate.exitMessage}</p>
          ) : (
            <>
              <h2 id="age-title" className="mb-4 text-[24px] font-bold leading-tight tracking-[-.03em]">
                {t.ageGate.title}
              </h2>
              <p className="mb-6 text-[14px] leading-[1.75] text-muted">{t.ageGate.text}</p>
              <label className="mb-6 flex cursor-pointer items-start gap-3 bg-ice p-4 text-start text-[13px] leading-relaxed">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-[18px] shrink-0 accent-navy" />
                <span>
                  {t.ageGate.agree} (
                  <Link href={href("/legal/terms")} target="_blank" className="underline underline-offset-2">
                    Terms
                  </Link>{" "}
                  ·{" "}
                  <Link href={href("/legal/ruo-agreement")} target="_blank" className="underline underline-offset-2">
                    RUO
                  </Link>
                  )
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setExited(true)} className="btn btn-ghost">
                  {t.ageGate.exit}
                </button>
                <button type="button" onClick={accept} disabled={!agreed} className="btn btn-navy">
                  <Icon name="check" className="size-[18px]" />
                  {t.ageGate.enter}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
