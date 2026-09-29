"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { PublicReview } from "@/lib/reviews";
import { submitReview } from "@/lib/customers/actions";
import { useCustomer } from "@/components/account/useCustomer";
import { formatDate, cn } from "@/lib/utils";

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex text-[#e0a800]", className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection({ reviews, products }: { reviews: PublicReview[]; products: { slug: string; name: string }[] }) {
  const { t, lang, href } = useI18n();
  const r = t.reviews;
  const [filter, setFilter] = useState("");
  const names = new Map(products.map((p) => [p.slug, p.name]));
  const visible = reviews.filter((x) => !filter || x.productSlug === filter);
  const average = visible.length ? visible.reduce((sum, x) => sum + x.rating, 0) / visible.length : 0;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="container-site scroll-mt-28 py-12 sm:py-14">
      <p className="eyebrow mb-2">{r.eyebrow}</p>
      <h2 id="reviews-title" className="mb-2 text-[28px] font-bold tracking-[-.03em] sm:text-[32px]">
        {r.title}
      </h2>
      <p className="mb-8 max-w-2xl text-[15px] text-muted">{r.description}</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <select aria-label={r.product} value={filter} onChange={(e) => setFilter(e.target.value)} className="field max-w-[280px]">
              <option value="">{r.all}</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            {visible.length ? (
              <p className="flex items-center gap-2 text-[14px] font-bold">
                <Stars value={average} className="text-[18px]" />
                <span>
                  {average.toFixed(1)} · {visible.length}
                </span>
              </p>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <p className="border border-line bg-mist px-5 py-8 text-center text-[14px] text-muted">{r.empty}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((x) => (
                <li key={x.id} className="border border-line p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={x.rating} />
                    <span className="sr-only">
                      {x.rating} {r.stars}
                    </span>
                    {!filter ? <span className="text-[13px] font-bold">{names.get(x.productSlug) ?? x.productSlug}</span> : null}
                  </div>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed">{x.body}</p>
                  <p className="mt-3 text-[12px] text-muted">
                    {x.author} · {formatDate(x.date, lang)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ReviewForm products={products} defaultProduct={filter} loginHref={href("/account")} />
      </div>
    </section>
  );
}

function ReviewForm({ products, defaultProduct, loginHref }: { products: { slug: string; name: string }[]; defaultProduct: string; loginHref: string }) {
  const { t, lang } = useI18n();
  const r = t.reviews;
  const { customer, loaded } = useCustomer();
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = product || defaultProduct;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) return setMessage({ ok: false, text: r.tooShort });
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await submitReview({ productSlug: selected, rating, body, lang });
        if (result.ok) {
          setBody("");
          setMessage({ ok: true, text: r.sent });
        } else setMessage({ ok: false, text: result.error === "login" ? r.loginPrompt : result.error === "tooShort" ? r.tooShort : r.error });
      } catch {
        setMessage({ ok: false, text: r.error });
      }
    });
  }

  return (
    <aside className="h-fit border border-line bg-mist p-5 sm:p-6 lg:sticky lg:top-28">
      <h3 className="mb-4 text-[18px] font-bold">{r.writeTitle}</h3>
      {!loaded ? (
        <div className="h-40" aria-busy="true" />
      ) : !customer ? (
        <>
          <p className="mb-4 text-[14px] leading-relaxed text-muted">{r.loginPrompt}</p>
          <Link href={loginHref} className="btn btn-navy w-full">
            {r.loginCta}
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <p className="text-[13px] text-muted">
            {r.signedInAs} <strong className="text-navy">{customer.name}</strong>
          </p>
          <div>
            <label htmlFor="review-product" className="field-label">
              {r.product}
            </label>
            <select id="review-product" required value={selected} onChange={(e) => setProduct(e.target.value)} className="field">
              <option value="" disabled>
                {r.choose}
              </option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="field-label">{r.rating}</legend>
            <div className="flex gap-1 text-[28px] leading-none" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} ${r.stars}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-[#e0a800]" : "text-line hover:text-[#e0a800]/60"}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="review-body" className="field-label">
              {r.text}
            </label>
            <textarea
              id="review-body"
              rows={5}
              required
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={r.placeholder}
              className="field min-h-[120px] py-3"
            />
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{r.rules}</p>
          </div>
          {message ? (
            <p role="status" className={cn("text-[13px] font-bold", message.ok ? "text-success" : "text-danger")}>
              {message.text}
            </p>
          ) : null}
          <button type="submit" disabled={pending || !selected} className="btn btn-navy">
            {pending ? t.common.sending : r.submit}
          </button>
        </form>
      )}
    </aside>
  );
}
