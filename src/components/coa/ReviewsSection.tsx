"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
const MAX_VIDEO_MB = 15;
const IMAGE_MAX_SIDE = 1600;

/** Downscale a photo in the browser before upload (phone photos are often 5–12 MB). */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // format the browser cannot decode: send as is, the server limit still applies
  }
}

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
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
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
      if (!type) {
        setMessage({ ok: false, text: r.uploadError });
        continue;
      }
      if (type === "video" && file.size > MAX_VIDEO_MB * 1024 * 1024) {
        setMessage({ ok: false, text: r.tooLarge });
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const data = type === "image" ? await compressImage(file) : file;
        const base = file.name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-") || "media";
        const ext = type === "image" ? (data === file ? file.name.split(".").pop()?.toLowerCase() ?? "jpg" : "jpg") : file.name.split(".").pop()?.toLowerCase() ?? "mp4";
        const blob = await upload(`reviews/${base}.${ext}`, data, { access: "public", handleUploadUrl: "/api/reviews/upload", clientPayload: type, contentType: data.type || file.type });
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
          router.refresh(); // show the new review in the list right away
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

          {/* Photos / videos: optional, uploaded straight to storage, shown after moderation. */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            {media.length + uploading < MAX_FILES ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={cn(
                  "flex w-full items-center gap-3 rounded-sm border-2 border-dashed px-4 py-3.5 text-start transition-colors",
                  dragging ? "border-navy bg-ice" : "border-line bg-mist hover:border-navy/50 hover:bg-ice",
                )}
              >
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-navy shadow-[0_2px_8px_rgba(26,47,66,.12)]">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.4-2h5.6l1.4 2h1.3A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
                    <circle cx="12" cy="12.5" r="3.5" />
                  </svg>
                </span>
                <span className="text-[14px] font-bold text-navy">{r.addMedia}</span>
                <Icon name="plus" className="ms-auto size-5 text-navy/60" />
              </button>
            ) : null}
            {media.length || uploading ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {media.map((m) => (
                  <div key={m.url} className="group relative aspect-square overflow-hidden rounded-sm bg-ice">
                    {m.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.preview} alt={m.name} className="size-full object-cover" />
                    ) : (
                      <>
                        <video src={m.preview} muted playsInline className="size-full object-cover" />
                        <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-navy/30 text-[16px] text-white">
                          ▶
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      aria-label={`${r.remove}: ${m.name}`}
                      onClick={() => removeMedia(m.url)}
                      className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-white"
                    >
                      <Icon name="close" className="size-3.5" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: uploading }, (_, i) => (
                  <div key={`u${i}`} aria-label={r.uploading} className="grid aspect-square animate-pulse place-items-center rounded-sm bg-ice">
                    <span className="size-5 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
                  </div>
                ))}
              </div>
            ) : null}
            <input ref={fileInput} type="file" hidden multiple accept="image/*,video/mp4,video/webm,video/quicktime" onChange={(e) => addFiles(e.target.files)} />
          </div>

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
