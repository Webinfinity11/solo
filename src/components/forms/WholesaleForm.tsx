"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/i18n/provider";
import { useCatalog } from "@/components/layout/CatalogProvider";
import { Field, FormSuccess } from "./Field";
import { site } from "@/data/site";

export function WholesaleForm() {
  const { t, lang } = useI18n();
  const { products } = useCatalog();
  const f = t.wholesale.fields;
  const [sent, setSent] = useState(false);

  const schema = z.object({
    company: z.string().trim().min(2, t.common.required),
    name: z.string().trim().min(2, t.common.required),
    email: z.string().trim().min(1, t.common.required).email(t.common.invalidEmail),
    phone: z.string().trim().optional(),
    country: z.string().trim().min(2, t.common.required),
    products: z.array(z.string()).optional(),
    volume: z.string().min(1, t.common.required),
    message: z.string().trim().optional(),
  });
  type Values = z.infer<typeof schema>;
  const { register, handleSubmit, reset, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { products: [], country: site.defaultCountry[lang] } });
  const e = formState.errors;

  const onSubmit = handleSubmit(async () => {
    // Placeholder: send to email/CRM on the backend stage.
    setSent(true);
    reset();
  });

  const invalid = (k: keyof Values) => (e[k] ? { "aria-invalid": true as const, "aria-describedby": `ws-${k}-error` } : {});

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field id="ws-company" label={f.company} error={e.company?.message} required>
        <input id="ws-company" className="field" autoComplete="organization" {...register("company")} {...invalid("company")} />
      </Field>
      <Field id="ws-name" label={f.name} error={e.name?.message} required>
        <input id="ws-name" className="field" autoComplete="name" {...register("name")} {...invalid("name")} />
      </Field>
      <Field id="ws-email" label={f.email} error={e.email?.message} required>
        <input id="ws-email" type="email" className="field" autoComplete="email" {...register("email")} {...invalid("email")} />
      </Field>
      <Field id="ws-phone" label={f.phone}>
        <input id="ws-phone" type="tel" className="field" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field id="ws-country" label={f.country} error={e.country?.message} required>
        <input id="ws-country" className="field" autoComplete="country-name" {...register("country")} {...invalid("country")} />
      </Field>
      <Field id="ws-volume" label={f.volume} error={e.volume?.message} required>
        <select id="ws-volume" className="field" defaultValue="" {...register("volume")} {...invalid("volume")}>
          <option value="" disabled>
            -
          </option>
          {t.wholesale.volumeOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="field-label">{f.products}</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border border-line bg-mist p-4 sm:grid-cols-3">
          {products.map((p) => (
            <label key={p.slug} className="flex cursor-pointer items-center gap-2 text-[14px]">
              <input type="checkbox" value={p.slug} className="size-4 accent-navy" {...register("products")} />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="ws-message" label={f.message} className="sm:col-span-2">
        <textarea id="ws-message" rows={4} className="field" {...register("message")} />
      </Field>
      <div className="flex flex-col gap-4 sm:col-span-2">
        {sent ? <FormSuccess>{t.wholesale.success}</FormSuccess> : null}
        <button type="submit" disabled={formState.isSubmitting} className="btn btn-navy w-full sm:w-auto sm:self-start">
          {formState.isSubmitting ? t.common.sending : t.wholesale.submit}
        </button>
      </div>
    </form>
  );
}
