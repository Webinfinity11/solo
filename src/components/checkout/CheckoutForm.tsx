"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, type ReactNode } from "react";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { placeOrder } from "@/lib/orders";
import { discountAmount } from "@/lib/promo-codes";
import { cn, formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/forms/Field";
import { useCartLines } from "@/components/cart/CartLine";
import { OrderSummary } from "./OrderSummary";
import { useCustomer } from "@/components/account/useCustomer";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-8">
      <legend className="mb-5 flex items-center gap-3 text-[20px] font-bold tracking-[-.02em]">
        <span className="hex-shape grid h-[34px] w-[30px] place-items-center bg-navy text-[13px] text-white">{n}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function CheckoutForm() {
  const { t, href, lang } = useI18n();
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const promo = useCart((s) => s.promo);
  const setPromo = useCart((s) => s.setPromo);
  const hydrated = useCartHydrated();
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<"order" | "promo" | null>(null);
  const { lines, subtotal } = useCartLines();
  const c = t.checkout;
  const f = c.fields;
  const ph = c.placeholders;

  const schema = z.object({
    firstName: z.string().trim().min(1, t.common.required),
    lastName: z.string().trim().min(1, t.common.required),
    phone: z.string().trim().min(6, t.common.required),
    email: z.string().trim().min(1, t.common.required).email(t.common.invalidEmail),
    city: z.string().trim().min(2, t.common.required),
    address: z.string().trim().min(4, t.common.required),
    note: z.string().trim().max(1000).optional(),
    payment: z.enum(["bank", "cod"]),
    confirm: z.literal(true, { message: t.common.required }),
  });
  type Values = z.infer<typeof schema>;
  const { register, handleSubmit, watch, formState, getValues, setValue } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { payment: "bank" },
  });
  const e = formState.errors;
  const invalid = (k: keyof Values) => (e[k] ? { "aria-invalid": true as const, "aria-describedby": `co-${k}-error` } : {});
  const payment = watch("payment");

  // Signed-in customers: fill empty fields from the account profile.
  const { customer } = useCustomer();
  useEffect(() => {
    if (!customer) return;
    const [firstName, ...rest] = customer.name.trim().split(/\s+/);
    const profile: Partial<Record<keyof Values, string>> = {
      firstName,
      lastName: rest.join(" "),
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
    };
    for (const [key, value] of Object.entries(profile) as [keyof Values, string][]) {
      if (value && !getValues(key)) setValue(key, value as never);
    }
  }, [customer, getValues, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const { confirm: _confirm, ...order } = values;
    const items = lines.map((l) => ({ variantId: l.variant.id, quantity: l.quantity }));
    const result = await placeOrder({ ...order, lang, items, promo: promo?.code }).catch(() => ({ ok: false as const, reason: undefined }));
    if (!result.ok) {
      if (result.reason === "promo") {
        setPromo(null);
        return setError("promo");
      }
      return setError("order");
    }
    setPlaced(true);
    const query = new URLSearchParams({ order: result.number, pay: result.payment, total: String(result.total) });
    router.push(`${href("/checkout/success")}?${query}`);
    clear();
  });

  if (!hydrated || placed) return <div aria-busy="true" className="h-[480px] animate-pulse bg-mist" />;

  if (!lines.length) {
    return (
      <div className="border border-dashed border-line px-6 py-16 text-center">
        <Icon name="cart" className="mx-auto mb-5 size-12 text-blue" />
        <p className="mb-6 text-[16px] text-muted">{c.empty}</p>
        <Link href={href("/products")} className="btn btn-navy">
          {t.cart.browse} <Icon name="arrow" className="size-[18px]" />
        </Link>
      </div>
    );
  }

  const input = (name: "firstName" | "lastName" | "phone" | "email" | "city" | "address", props: React.InputHTMLAttributes<HTMLInputElement>, className?: string) => (
    <Field id={`co-${name}`} label={f[name]} error={e[name]?.message} required className={className}>
      <input id={`co-${name}`} className="field" {...props} {...register(name)} {...invalid(name)} />
    </Field>
  );

  const submitting = formState.isSubmitting;
  const errorBox = error ? (
    <p role="alert" className="border-s-[3px] border-danger bg-[#fbecea] px-4 py-3 text-[14px] text-danger">
      {error === "promo" ? c.promoError : c.error}
    </p>
  ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-8">
        <Step n={1} title={c.contact}>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("firstName", { autoComplete: "given-name", placeholder: ph.firstName })}
            {input("lastName", { autoComplete: "family-name", placeholder: ph.lastName })}
            {input("phone", { type: "tel", autoComplete: "tel", placeholder: ph.phone })}
            {input("email", { type: "email", autoComplete: "email", placeholder: ph.email })}
          </div>
        </Step>

        <Step n={2} title={c.address}>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("city", { autoComplete: "address-level2" })}
            {input("address", { autoComplete: "street-address" })}
            <Field id="co-note" label={f.note} className="sm:col-span-2">
              <textarea id="co-note" rows={2} className="field min-h-[70px] py-3" {...register("note")} />
            </Field>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[14px] font-bold text-success">
            <Icon name="truck" className="size-5" /> {c.deliveryText}
          </p>
        </Step>

        <Step n={3} title={c.payment}>
          <div className="flex flex-col gap-2.5">
            {c.payments.map((m) => (
              <label
                key={m.id}
                className={cn("flex cursor-pointer items-start gap-4 border p-4 transition-colors", payment === m.id ? "border-navy bg-mist" : "border-line hover:border-blue")}
              >
                <input type="radio" value={m.id} className="mt-0.5 size-[18px] accent-navy" {...register("payment")} />
                <span className="flex-1">
                  <strong className="block text-[15px]">{m.label}</strong>
                  <small className="text-[13px] leading-relaxed text-muted">{m.text}</small>
                </span>
              </label>
            ))}
          </div>
        </Step>

        <div>
          <label className="flex cursor-pointer items-start gap-3 bg-ice p-4 text-[14px] leading-relaxed">
            <input type="checkbox" className="mt-0.5 size-[18px] shrink-0 accent-navy" {...register("confirm")} {...invalid("confirm")} />
            <span>{c.confirm}</span>
          </label>
          {e.confirm ? (
            <p id="co-confirm-error" className="field-error">
              {e.confirm.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 lg:hidden">
          {errorBox}
          <button type="submit" disabled={submitting} className="btn btn-navy w-full text-[15px]">
            {submitting ? t.common.sending : `${c.place} · ${formatPrice(subtotal - (promo ? discountAmount(subtotal, promo.percent) : 0))}`}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-[110px]">
        <OrderSummary lines={lines} subtotal={subtotal} shipping={0} />
        <div className="hidden flex-col gap-3 lg:flex">
          {errorBox}
          <button type="submit" disabled={submitting} className="btn btn-navy w-full text-[15px]">
            <Icon name="lock" className="size-[18px]" />
            {submitting ? t.common.sending : c.place}
          </button>
        </div>
      </div>
    </form>
  );
}
