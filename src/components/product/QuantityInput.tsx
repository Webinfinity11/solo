"use client";

import { MAX_QUANTITY } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  size = "md",
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const { t } = useI18n();
  const heights = { sm: "h-8", md: "h-10", lg: "h-12" };
  return (
    <div role="group" aria-label={label ?? t.product.quantity} className={cn("inline-flex shrink-0 items-center border border-line bg-white", heights[size])}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t.cart.decrease}
        className="grid h-full w-9 place-items-center transition-colors hover:bg-ice disabled:opacity-30"
      >
        <Icon name="minus" className="size-3.5" />
      </button>
      <output aria-live="polite" className="min-w-8 text-center text-[13px] font-bold">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}
        disabled={value >= MAX_QUANTITY}
        aria-label={t.cart.increase}
        className="grid h-full w-9 place-items-center transition-colors hover:bg-ice disabled:opacity-30"
      >
        <Icon name="plus" className="size-3.5" />
      </button>
    </div>
  );
}
