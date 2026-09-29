"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const schema = z.object({ email: z.string().trim().min(1, t.common.required).email(t.common.invalidEmail) });
  const { register, handleSubmit, reset, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    // Placeholder: connect to the email/CRM provider on the backend stage.
    setDone(true);
    reset();
  });

  const dark = tone === "dark";
  const error = formState.errors.email?.message;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex min-h-[46px] w-full">
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          {t.newsletter.label}
        </label>
        <input
          id={`newsletter-${tone}`}
          type="email"
          autoComplete="email"
          placeholder={t.newsletter.placeholder}
          aria-invalid={error ? "true" : undefined}
          {...register("email")}
          className={cn(
            "w-0 min-w-0 flex-1 border border-e-0 px-3.5 py-2.5 text-[14px] focus:outline-none",
            dark ? "border-blue/55 bg-transparent text-white placeholder:text-ice/70 focus:border-blue" : "border-line bg-white text-navy placeholder:text-muted focus:border-navy",
          )}
        />
        <button type="submit" className={cn("px-5 text-[13px] font-bold transition-colors", dark ? "bg-blue text-navy hover:bg-ice" : "bg-navy text-white hover:bg-navy-2")}>
          {t.newsletter.submit}
        </button>
      </div>
      {error ? <p className={cn("mt-2 text-[12px]", dark ? "text-blue" : "text-danger")}>{error}</p> : null}
      {done && !error ? (
        <p role="status" className={cn("mt-2 text-[12px]", dark ? "text-blue" : "text-success")}>
          {t.newsletter.success}
        </p>
      ) : null}
    </form>
  );
}
