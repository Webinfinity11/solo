"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, type ReactNode } from "react";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { useI18n } from "@/i18n/provider";
import { site } from "@/data/site";
import { cn, formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Field } from "@/components/forms/Field";
import { useCartLines } from "@/components/cart/CartLine";
import { OrderSummary } from "./OrderSummary";

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
  const { t, href } = useI18n();
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const hydrated = useCartHydrated();
  const [placed, setPlaced] = useState(false);
  const { lines, subtotal } = useCartLines();
  const c = t.checkout;
  const f = c.fields;

  const schema = z.object({
    email: z.string().trim().min(1, t.common.required).email(t.common.invalidEmail),
    phone: z.string().trim().min(6, t.common.required),
    firstName: z.string().trim().min(1, t.common.required),
    lastName: z.string().trim().min(1, t.common.required),
    country: z.string().trim().min(2, t.common.required),
    city: z.string().trim().min(2, t.common.required),
    address: z.string().trim().min(4, t.common.required),
    zip: z.string().trim().optional(),
    method: z.string(),
    confirm: z.literal(true, { message: t.common.required }),
  });
  type Values = z.infer<typeof schema>;
  const { register, handleSubmit, watch, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { country: "საქართველო", method: c.methods[0].id },
  });
  const e = formState.errors;
  const invalid = (k: keyof Values) => (e[k] ? { "aria-invalid": true as const, "aria-describedby": `co-${k}-error` } : {});

  const method = c.methods.find((m) => m.id === watch("method")) ?? c.methods[0];
  const freeShipping = method.id === "standard" && subtotal >= site.freeShippingThreshold;
  const shipping = freeShipping ? 0 : method.price;

  const onSubmit = handleSubmit(async () => {
    // Placeholder: create the order through the backend + payment gateway.
    setPlaced(true);
    router.push(href("/checkout/success"));
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

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-8">
        <Step n={1} title={c.contact}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="co-email" label={f.email} error={e.email?.message} required>
              <input id="co-email" type="email" autoComplete="email" className="field" {...register("email")} {...invalid("email")} />
            </Field>
            <Field id="co-phone" label={f.phone} error={e.phone?.message} required>
              <input id="co-phone" type="tel" autoComplete="tel" className="field" {...register("phone")} {...invalid("phone")} />
            </Field>
          </div>
        </Step>

        <Step n={2} title={c.address}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="co-firstName" label={f.firstName} error={e.firstName?.message} required>
              <input id="co-firstName" autoComplete="given-name" className="field" {...register("firstName")} {...invalid("firstName")} />
            </Field>
            <Field id="co-lastName" label={f.lastName} error={e.lastName?.message} required>
              <input id="co-lastName" autoComplete="family-name" className="field" {...register("lastName")} {...invalid("lastName")} />
            </Field>
            <Field id="co-country" label={f.country} error={e.country?.message} required>
              <input id="co-country" autoComplete="country-name" className="field" {...register("country")} {...invalid("country")} />
            </Field>
            <Field id="co-city" label={f.city} error={e.city?.message} required>
              <input id="co-city" autoComplete="address-level2" className="field" {...register("city")} {...invalid("city")} />
            </Field>
            <Field id="co-address" label={f.address} error={e.address?.message} required className="sm:col-span-2">
              <input id="co-address" autoComplete="street-address" className="field" {...register("address")} {...invalid("address")} />
            </Field>
            <Field id="co-zip" label={f.zip}>
              <input id="co-zip" autoComplete="postal-code" className="field" {...register("zip")} />
            </Field>
          </div>
        </Step>

        <Step n={3} title={c.method}>
          <div className="flex flex-col gap-2.5">
            {c.methods.map((m) => {
              const free = m.id === "standard" && subtotal >= site.freeShippingThreshold;
              const checked = method.id === m.id;
              return (
                <label key={m.id} className={cn("flex cursor-pointer items-center gap-4 border p-4 transition-colors", checked ? "border-navy bg-mist" : "border-line hover:border-blue")}>
                  <input type="radio" value={m.id} className="size-[18px] accent-navy" {...register("method")} />
                  <span className="flex-1">
                    <strong className="block text-[15px]">{m.label}</strong>
                    <small className="text-[13px] text-muted">{m.time}</small>
                  </span>
                  <span className="text-[15px] font-bold">{free ? c.free : formatPrice(m.price)}</span>
                </label>
              );
            })}
          </div>
        </Step>

        <Step n={4} title={c.payment}>
          <div className="flex items-center gap-3 border border-dashed border-line bg-mist p-5 text-[14px] text-muted">
            <Icon name="lock" className="size-5 text-navy" />
            {c.paymentPending}
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
        <button type="submit" disabled={formState.isSubmitting} className="btn btn-navy w-full text-[15px] lg:hidden">
          {c.place} · {formatPrice(subtotal + shipping)}
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-[110px]">
        <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} />
        <button type="submit" disabled={formState.isSubmitting} className="btn btn-navy hidden w-full text-[15px] lg:flex">
          <Icon name="lock" className="size-[18px]" />
          {c.place}
        </button>
      </div>
    </form>
  );
}
