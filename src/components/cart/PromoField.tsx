"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { checkPromo } from "@/lib/promo";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Promo code input; once a code is confirmed it shows as a chip that can be removed. */
export function PromoField({ className }: { className?: string }) {
  const { t } = useI18n();
  const promo = useCart((s) => s.promo);
  const setPromo = useCart((s) => s.setPromo);
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [pending, startTransition] = useTransition();

  if (promo) {
    return (
      <div className={cn("flex items-center justify-between gap-3 border border-success/40 bg-[#eaf5ef] px-4 py-3 text-[14px]", className)}>
        <span>
          <span className="block text-[12px] text-success">{t.cart.promoApplied}</span>
          <strong className="font-mono tracking-wide">{promo.code}</strong> <span className="font-bold text-success">-{promo.percent}%</span>
        </span>
        <button type="button" onClick={() => setPromo(null)} className="text-[13px] text-muted underline underline-offset-4 hover:text-danger">
          {t.cart.promoRemove}
        </button>
      </div>
    );
  }

  function apply() {
    if (!value.trim() || pending) return;
    setInvalid(false);
    startTransition(async () => {
      const result = await checkPromo(value).catch(() => ({ ok: false as const }));
      if (result.ok) {
        setPromo({ code: result.code, percent: result.percent });
        setValue("");
      } else setInvalid(true);
    });
  }

  // Not a <form>: on checkout this sits inside the order form, and forms cannot nest.
  return (
    <div className={className}>
      <label htmlFor="promo" className="field-label">
        {t.cart.promo}
      </label>
      <div className="flex">
        <input
          id="promo"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "promo-error" : undefined}
          autoCapitalize="characters"
          className="field min-h-11 border-e-0 bg-white uppercase"
        />
        <button type="button" onClick={apply} disabled={!value.trim() || pending} className="shrink-0 bg-navy px-4 text-[13px] font-bold text-white disabled:opacity-50">
          {t.cart.promoApply}
        </button>
      </div>
      {invalid ? (
        <p id="promo-error" className="field-error">
          {t.cart.promoInvalid}
        </p>
      ) : null}
    </div>
  );
}

/** Creator links like soloresearch.ge/?promo=NINO10 apply the code automatically. */
export function PromoFromUrl() {
  const params = useSearchParams();
  const code = params.get("promo");
  const setPromo = useCart((s) => s.setPromo);
  // Wait for the saved cart to load, or it would overwrite the code again.
  const hydrated = useCartHydrated();
  useEffect(() => {
    if (!code || !hydrated) return;
    let cancelled = false;
    checkPromo(code)
      .then((result) => {
        if (!cancelled && result.ok) setPromo({ code: result.code, percent: result.percent });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, hydrated, setPromo]);
  return null;
}
