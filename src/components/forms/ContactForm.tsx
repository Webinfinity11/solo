"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/i18n/provider";
import { Field, FormSuccess } from "./Field";

export function ContactForm() {
  const { t } = useI18n();
  const f = t.contact.fields;
  const [sent, setSent] = useState(false);
  const schema = z.object({
    name: z.string().trim().min(2, t.common.required),
    email: z.string().trim().min(1, t.common.required).email(t.common.invalidEmail),
    subject: z.string().trim().min(2, t.common.required),
    message: z.string().trim().min(10, t.common.tooShort),
  });
  type Values = z.infer<typeof schema>;
  const { register, handleSubmit, reset, formState } = useForm<Values>({ resolver: zodResolver(schema) });
  const e = formState.errors;
  const invalid = (k: keyof Values) => (e[k] ? { "aria-invalid": true as const, "aria-describedby": `ct-${k}-error` } : {});

  const onSubmit = handleSubmit(async () => {
    // Placeholder: send to email/CRM on the backend stage.
    setSent(true);
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field id="ct-name" label={f.name} error={e.name?.message} required>
        <input id="ct-name" className="field" autoComplete="name" {...register("name")} {...invalid("name")} />
      </Field>
      <Field id="ct-email" label={f.email} error={e.email?.message} required>
        <input id="ct-email" type="email" className="field" autoComplete="email" {...register("email")} {...invalid("email")} />
      </Field>
      <Field id="ct-subject" label={f.subject} error={e.subject?.message} required className="sm:col-span-2">
        <input id="ct-subject" className="field" {...register("subject")} {...invalid("subject")} />
      </Field>
      <Field id="ct-message" label={f.message} error={e.message?.message} required className="sm:col-span-2">
        <textarea id="ct-message" rows={6} className="field" {...register("message")} {...invalid("message")} />
      </Field>
      <div className="flex flex-col gap-4 sm:col-span-2">
        {sent ? <FormSuccess>{t.contact.success}</FormSuccess> : null}
        <button type="submit" disabled={formState.isSubmitting} className="btn btn-navy w-full sm:w-auto sm:self-start">
          {formState.isSubmitting ? t.common.sending : t.contact.submit}
        </button>
      </div>
    </form>
  );
}
