"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { useI18n } from "@/i18n/provider";
import type { PublicReview, ReviewMedia } from "@/lib/reviews";
import { submitReview } from "@/lib/customers/actions";
import { useCustomer } from "@/components/account/useCustomer";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { cn, formatDate } from "@/lib/utils";

const PAGE = 6;
const MAX_FILES = 4;
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-px text-[#e0a800]", className)} aria-hidden="true" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "" : "text-[#d5dde5]"}>
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Reviews block. On the lab results page it lists every product with a product filter;
 * on a product page (`product` set) it shows only that product's reviews.
 */
export function ReviewsSection({
  reviews,
  products,
  product,
}: {
  reviews: PublicReview[];
  products: { slug: string; name: string }[];
  product?: { slug: string; name: string };
}) {
  const { t, lang, href } = useI18n();
  const r = t.reviews;
  const [filter, setFilter] = useState(product?.slug ?? "");
  const [shown, setShown] = useState(PAGE);
  const [lightbox, setLightbox] = useState<{ media: ReviewMedia; name: string } | null>(null);
  const names = new Map(products.map((p) => [p.slug, p.name]));
  const visible = reviews.filter((x) => !filter || x.productSlug === filter);
  const average = visible.length ? visible.reduce((sum, x) => sum + x.rating, 0) / visible.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: visible.filter((x) => x.rating === stars).length }));

  return (
    <section id="reviews" aria-labelledby="reviews-title" className={cn("scroll-mt-28", product ? "container-site pb-14" : "bg-mist py-12 sm:py-16")}>
      <div className={product ? "" : "container-site"}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">{r.eyebrow}</p>
            <h2 id="reviews-title" className="text-[28px] font-bold tracking-[-.03em] sm:text-[32px]">
              {product ? r.productTitle : r.title}
            </h2>
            {product ? null : <p className="mt-2 max-w-2xl text-[15px] text-muted">{r.description}</p>}
          </div>
          {product ? null : (
            <select aria-label={r.product} value={filter} onChange={(e) => (setFilter(e.target.value), setShown(PAGE))} className="field w-full max-w-[280px] bg-white">
              <option value="">{r.all}</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="min-w-0">
            {visible.length ? (
              <>
                {/* Summary: average, stars, count and how the ratings are spread. */}
                <div className="mb-6 grid gap-6 border border-line bg-white p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10 sm:p-6">
                  <div className="text-center sm:text-start">
                    <p className="text-[48px] font-bold leading-none tracking-[-.04em]">{average.toFixed(1)}</p>
                    <Stars value={average} className="mt-2 text-[20px]" />
                    <p className="mt-1 text-[13px] text-muted">{r.count(visible.length)}</p>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {distribution.map((d) => (
                      <li key={d.stars} className="flex items-center gap-3 text-[13px]">
                        <span className="w-8 shrink-0 font-bold" dir="ltr">
                          {d.stars} ★
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-ice">
                          <span className="block h-full rounded-full bg-[#e0a800]" style={{ width: `${(d.count / visible.length) * 100}%` }} />
                        </span>
                        <span className="w-6 shrink-0 text-end text-muted">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="flex flex-col gap-4">
                  {visible.slice(0, shown).map((x) => (
                    <li key={x.id} className="border border-line bg-white p-5 sm:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-[15px] font-bold text-white">
                          {x.author.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold">{x.author}</p>
                          <p className="text-[12px] text-muted">{formatDate(x.date, lang)}</p>
                        </div>
                        <Stars value={x.rating} className="text-[16px]" />
                        <span className="sr-only">
                          {x.rating} {r.stars}
                        </span>
                      </div>
                      {!product && !filter ? (
                        <Link href={href(`/products/${x.productSlug}`)} className="mb-2 inline-block bg-ice px-2 py-0.5 text-[12px] font-bold hover:bg-blue">
                          {names.get(x.productSlug) ?? x.productSlug}
                        </Link>
                      ) : null}
                      <p className="whitespace-pre-line text-[15px] leading-relaxed">{x.body}</p>
                      {x.media.length ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {x.media.map((m) => (
                            <li key={m.url}>
                              <button
                                type="button"
                                aria-label={r.viewMedia}
                                onClick={() => setLightbox({ media: m, name: names.get(x.productSlug) ?? "" })}
                                className="relative block size-20 overflow-hidden border border-line bg-ice sm:size-24"
                              >
                                {m.type === "image" ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.url} alt="" loading="lazy" className="size-full object-cover transition-transform hover:scale-105" />
                                ) : (
                                  <>
                                    <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline className="size-full object-cover" />
                                    <span className="absolute inset-0 grid place-items-center bg-navy/35 text-[22px] text-white">▶</span>
                                  </>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {visible.length > shown ? (
                  <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn btn-ghost mt-5 w-full bg-white">
                    {r.allReviews} ({visible.length - shown})
                  </button>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 border border-dashed border-line bg-white px-6 py-12 text-center">
                <Stars value={0} className="text-[28px]" />
                <p className="max-w-sm text-[15px] text-muted">{product ? r.beFirst : r.empty}</p>
              </div>
            )}
          </div>

          <ReviewForm products={products} fixed={product?.slug} defaultProduct={filter} loginHref={href("/account")} />
        </div>
      </div>

      <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} title={lightbox?.name ?? ""} closeLabel={t.common.close} className="w-[900px]">
        {lightbox ? (
          <div className="grid place-items-center bg-[#0b1520] p-2">
            {lightbox.media.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.media.url} alt="" className="max-h-[75dvh] w-auto object-contain" />
            ) : (
              <video src={lightbox.media.url} controls autoPlay playsInline className="max-h-[75dvh] w-full" />
            )}
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

type Attachment = ReviewMedia & { preview: string; name: string };

function ReviewForm({ products, fixed, defaultProduct, loginHref }: { products: { slug: string; name: string }[]; fixed?: string; defaultProduct: string; loginHref: string }) {
  const { t, lang } = useI18n();
  const r = t.reviews;
  const { customer, loaded } = useCustomer();
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = fixed ?? (product || defaultProduct);

  function removeMedia(url: string) {
    setMedia((list) => {
      list.filter((x) => x.url === url).forEach((x) => URL.revokeObjectURL(x.preview));
      return list.filter((x) => x.url !== url);
    });
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage(null);
    const room = MAX_FILES - media.length - uploading;
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
      const limit = (type === "video" ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024;
      if (!type || file.size > limit) {
        setMessage({ ok: false, text: r.uploadError });
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const blob = await upload(`reviews/${safe}`, file, { access: "public", handleUploadUrl: "/api/reviews/upload", clientPayload: type });
        setMedia((list) => [...list, { url: blob.url, type, preview: URL.createObjectURL(file), name: file.name }]);
      } catch {
        setMessage({ ok: false, text: r.uploadError });
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) return setMessage({ ok: false, text: r.tooShort });
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await submitReview({ productSlug: selected, rating, body, lang, media: media.map(({ url, type }) => ({ url, type })) });
        if (result.ok) {
          setBody("");
          media.forEach((m) => URL.revokeObjectURL(m.preview));
          setMedia([]);
          setMessage({ ok: true, text: r.sent });
        } else setMessage({ ok: false, text: result.error === "login" ? r.loginPrompt : result.error === "tooShort" ? r.tooShort : r.error });
      } catch {
        setMessage({ ok: false, text: r.error });
      }
    });
  }

  return (
    <aside className="h-fit border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-28">
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
          {fixed ? null : (
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
          )}
          <fieldset>
            <legend className="field-label">{r.rating}</legend>
            <div className="flex gap-1 text-[30px] leading-none" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} ${r.stars}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-[#e0a800]" : "text-[#d5dde5] hover:text-[#e0a800]/60"}
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
          </div>

          {/* Photos / videos, uploaded straight to storage; shown after moderation. */}
          <div>
            <div className="flex flex-wrap gap-2">
              {media.map((m) => (
                <div key={m.url} className="relative size-[72px] overflow-hidden border border-line bg-ice">
                  {m.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.preview} alt={m.name} className="size-full object-cover" />
                  ) : (
                    <video src={m.preview} muted playsInline className="size-full object-cover" />
                  )}
                  <button
                    type="button"
                    aria-label={`${r.remove}: ${m.name}`}
                    onClick={() => removeMedia(m.url)}
                    className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-navy/85 text-white hover:bg-navy"
                  >
                    <Icon name="close" className="size-3.5" />
                  </button>
                </div>
              ))}
              {Array.from({ length: uploading }, (_, i) => (
                <div key={`u${i}`} className="grid size-[72px] animate-pulse place-items-center border border-dashed border-line bg-mist text-[11px] text-muted">
                  {r.uploading}
                </div>
              ))}
              {media.length + uploading < MAX_FILES ? (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex size-[72px] flex-col items-center justify-center gap-1 border border-dashed border-navy/40 text-[11px] font-bold leading-tight text-navy transition-colors hover:border-navy hover:bg-mist"
                >
                  <Icon name="plus" className="size-5" />
                  {r.addMedia}
                </button>
              ) : null}
            </div>
            <input
              ref={fileInput}
              type="file"
              hidden
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/webm,video/quicktime"
              onChange={(e) => addFiles(e.target.files)}
            />
            <p className="mt-1.5 text-[12px] text-muted">{r.mediaHint}</p>
          </div>

          <p className="text-[12px] leading-relaxed text-muted">{r.rules}</p>
          {message ? (
            <p role="status" className={cn("text-[13px] font-bold", message.ok ? "text-success" : "text-danger")}>
              {message.text}
            </p>
          ) : null}
          <button type="submit" disabled={pending || uploading > 0 || !selected} className="btn btn-navy">
            {pending ? t.common.sending : r.submit}
          </button>
        </form>
      )}
    </aside>
  );
}
