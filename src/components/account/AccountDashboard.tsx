"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import {
  changePassword,
  deleteMyReview,
  getAccountData,
  updateMyReview,
  updateProfile,
  type AccountData,
  type AccountOrder,
  type AccountReview,
} from "@/lib/customers/actions";
import type { Customer } from "@/lib/customers/auth";
import { useCatalog } from "@/components/layout/CatalogProvider";
import { ProductImage } from "@/components/brand/ProductImage";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn, formatDate, formatPrice } from "@/lib/utils";

type Tab = "overview" | "orders" | "reviews" | "settings";
const TABS: { id: Tab; icon: IconName }[] = [
  { id: "overview", icon: "user" },
  { id: "orders", icon: "box" },
  { id: "reviews", icon: "check" },
  { id: "settings", icon: "lock" },
];

const STATUS_STYLE: Record<AccountOrder["status"], string> = {
  new: "bg-[#fff4d6] text-[#8a6100]",
  paid: "bg-ice text-navy",
  shipped: "bg-ice text-navy",
  completed: "bg-[#eaf5ef] text-success",
  cancelled: "bg-mist text-muted",
};
const REVIEW_STYLE = { pending: "bg-[#fff4d6] text-[#8a6100]", approved: "bg-[#eaf5ef] text-success", rejected: "bg-mist text-muted" };

export function AccountDashboard({ customer, onCustomer, onLogout }: { customer: Customer; onCustomer: (c: Customer) => void; onLogout: () => void }) {
  const { t } = useI18n();
  const d = t.account.dash;
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<AccountData | null>(null);

  // #orders, #reviews, #settings open that tab directly (e.g. from the checkout confirmation).
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.some((x) => x.id === h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    getAccountData()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  function open(next: Tab) {
    setTab(next);
    history.replaceState(null, "", `#${next}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
      <aside className="h-fit min-w-0 border border-line bg-white">
        <div className="flex items-center gap-3 border-b border-line p-5">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-[18px] font-bold text-white">
            {customer.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{customer.name}</p>
            <p className="truncate text-[12px] text-muted">{customer.email}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col" aria-label={t.account.eyebrow}>
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => open(x.id)}
              aria-current={tab === x.id ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 px-3 py-2.5 text-start text-[14px] font-bold transition-colors",
                tab === x.id ? "bg-navy text-white" : "hover:bg-mist",
              )}
            >
              <Icon name={x.icon} className="size-[18px]" />
              {d[x.id]}
              {x.id === "orders" && data?.orders.length ? <span className="ms-auto text-[12px] opacity-70">{data.orders.length}</span> : null}
              {x.id === "reviews" && data?.reviews.length ? <span className="ms-auto text-[12px] opacity-70">{data.reviews.length}</span> : null}
            </button>
          ))}
          <button type="button" onClick={onLogout} className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-start text-[14px] text-muted hover:bg-mist hover:text-navy">
            <Icon name="arrow" className="size-[18px] rotate-180" />
            {t.account.logout}
          </button>
        </nav>
      </aside>

      <div className="min-w-0">
        {!data ? (
          <div className="h-64 animate-pulse border border-line bg-mist" aria-busy="true" />
        ) : tab === "overview" ? (
          <Overview data={data} open={open} />
        ) : tab === "orders" ? (
          <Orders data={data} />
        ) : tab === "reviews" ? (
          <Reviews data={data} onChange={(reviews) => setData((prev) => (prev ? { ...prev, reviews } : prev))} />
        ) : (
          <Settings
            customer={customer}
            onSaved={(c) => {
              onCustomer(c);
              setData((prev) => (prev ? { ...prev, customer: c } : prev));
            }}
          />
        )}
      </div>
    </div>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-bold tracking-[-.02em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-line px-6 py-10 text-center">
      <p className="text-[15px] text-muted">{text}</p>
      <Link href={href} className="btn btn-navy">
        {cta} <Icon name="arrow" className="size-[18px]" />
      </Link>
    </div>
  );
}

function Overview({ data, open }: { data: AccountData; open: (tab: Tab) => void }) {
  const { t, href } = useI18n();
  const d = t.account.dash;
  const spent = data.orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const stats = [
    { label: d.ordersStat, value: String(data.orders.length), tab: "orders" as Tab },
    { label: d.reviewsStat, value: String(data.reviews.length), tab: "reviews" as Tab },
    { label: d.spentStat, value: formatPrice(spent), tab: "orders" as Tab },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-navy p-6 text-white sm:p-8">
        <p className="eyebrow mb-2 text-blue">{t.account.eyebrow}</p>
        <h2 className="mb-2 text-[26px] font-bold tracking-[-.03em]">
          {d.hello}, {data.customer.name.split(" ")[0]}
        </h2>
        <p className="text-[15px] text-white/75">{d.intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={() => open(s.tab)} className="border border-line bg-white p-5 text-start transition-colors hover:border-navy">
            <p className="text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">{s.label}</p>
            <p className="mt-1 text-[28px] font-bold tracking-[-.03em]">{s.value}</p>
          </button>
        ))}
      </div>
      <Panel
        title={d.latestOrder}
        action={
          data.orders.length > 1 ? (
            <button type="button" onClick={() => open("orders")} className="text-link text-[13px]">
              {d.allOrders} <Icon name="arrow" className="size-4" />
            </button>
          ) : null
        }
      >
        {data.orders[0] ? <OrderCard order={data.orders[0]} bank={data.bank} defaultOpen /> : <Empty text={d.noOrders} cta={d.shopNow} href={href("/products")} />}
      </Panel>
    </div>
  );
}

function Orders({ data }: { data: AccountData }) {
  const { t, href } = useI18n();
  const d = t.account.dash;
  return (
    <Panel title={d.orders}>
      {data.orders.length ? (
        <ul className="flex flex-col gap-3">
          {data.orders.map((o, i) => (
            <li key={o.number}>
              <OrderCard order={o} bank={data.bank} defaultOpen={i === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty text={d.noOrders} cta={d.shopNow} href={href("/products")} />
      )}
    </Panel>
  );
}

function OrderCard({ order, bank, defaultOpen }: { order: AccountOrder; bank: AccountData["bank"]; defaultOpen?: boolean }) {
  const { t, lang, href } = useI18n();
  const d = t.account.dash;
  const { findVariant } = useCatalog();
  const [openCard, setOpenCard] = useState(Boolean(defaultOpen));
  const payment = t.checkout.payments.find((p) => p.id === order.payment)?.label ?? order.payment;
  const bankRows = [bank.recipient, bank.bankName, bank.iban].filter(Boolean);

  return (
    <div className="border border-line">
      <button type="button" onClick={() => setOpenCard((v) => !v)} aria-expanded={openCard} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-start hover:bg-mist">
        <span className="font-mono text-[14px] font-bold">{order.number}</span>
        <span className={cn("px-2 py-0.5 text-[11px] font-bold", STATUS_STYLE[order.status])}>{d.status[order.status]}</span>
        <span className="text-[13px] text-muted">{formatDate(order.createdAt.slice(0, 10), lang)}</span>
        <span className="ms-auto text-[15px] font-bold">{formatPrice(order.total)}</span>
        <Icon name="down" className={cn("size-4 transition-transform", openCard && "rotate-180")} />
      </button>
      {openCard ? (
        <div className="border-t border-line p-4">
          <ul className="mb-4 divide-y divide-line">
            {order.items.map((item) => {
              const found = findVariant(item.variantId);
              return (
                <li key={item.variantId} className="flex items-center gap-3 py-2.5">
                  <span className="block size-12 shrink-0 overflow-hidden bg-photo">
                    <ProductImage name={item.name} src={found?.variant.image ?? found?.product.images[0]} label={item.label} sizes="48px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    {found ? (
                      <Link href={href(`/products/${item.productSlug}`)} className="block truncate text-[14px] font-bold hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-[14px] font-bold">{item.name}</span>
                    )}
                    <span className="text-[12px] text-muted">
                      {item.label} × {item.quantity}
                    </span>
                  </span>
                  <span className="text-[14px] font-bold">{formatPrice(item.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-muted">{d.delivery}</dt>
              <dd className="font-bold">
                {order.city}, {order.address}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{d.payment}</dt>
              <dd className="font-bold">{payment}</dd>
            </div>
          </dl>
          {order.payment === "bank" && order.status === "new" && bankRows.length ? (
            <div className="mt-4 border-s-[3px] border-blue bg-ice px-4 py-3 text-[13px] leading-relaxed">
              <p className="mb-1">{d.payNow}</p>
              <p className="font-bold">
                {bankRows.join(" · ")} · {formatPrice(order.total)} · {order.number}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Reviews({ data, onChange }: { data: AccountData; onChange: (reviews: AccountReview[]) => void }) {
  const { t, href } = useI18n();
  const d = t.account.dash;
  return (
    <Panel title={d.reviews}>
      {data.reviews.length ? (
        <ul className="flex flex-col gap-3">
          {data.reviews.map((r) => (
            <li key={r.id}>
              <ReviewItem
                review={r}
                onSaved={(next) => onChange(data.reviews.map((x) => (x.id === next.id ? next : x)))}
                onDeleted={() => onChange(data.reviews.filter((x) => x.id !== r.id))}
              />
            </li>
          ))}
        </ul>
      ) : (
        <Empty text={d.noReviews} cta={d.writeReview} href={`${href("/coa")}#reviews`} />
      )}
    </Panel>
  );
}

/** One of the customer's reviews, editable in place (rating, text, attachments) or deletable. */
function ReviewItem({ review, onSaved, onDeleted }: { review: AccountReview; onSaved: (r: AccountReview) => void; onDeleted: () => void }) {
  const { t, lang, href } = useI18n();
  const d = t.account.dash;
  const { bySlug } = useCatalog();
  const product = bySlug.get(review.productSlug);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [body, setBody] = useState(review.body);
  const [media, setMedia] = useState(review.media);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function cancel() {
    setEditing(false);
    setRating(review.rating);
    setBody(review.body);
    setMedia(review.media);
    setMessage(null);
  }

  function save() {
    if (body.trim().length < 10) return setMessage({ ok: false, text: t.reviews.tooShort });
    startTransition(async () => {
      const result = await updateMyReview({ id: review.id, rating, body, media }).catch(() => ({ ok: false as const, error: "error" as const }));
      if (result.ok) {
        onSaved({ ...review, rating, body: body.trim(), media });
        setEditing(false);
        setMessage({ ok: true, text: d.reviewSaved });
      } else setMessage({ ok: false, text: result.error === "tooShort" ? t.reviews.tooShort : t.reviews.error });
    });
  }

  function remove() {
    if (!window.confirm(d.confirmDelete)) return;
    startTransition(async () => {
      const result = await deleteMyReview(review.id).catch(() => ({ ok: false as const, error: "error" as const }));
      if (result.ok) onDeleted();
      else setMessage({ ok: false, text: t.reviews.error });
    });
  }

  return (
    <div className="flex gap-4 border border-line p-4">
      <span className="block size-16 shrink-0 overflow-hidden bg-photo">
        <ProductImage name={product?.name ?? review.productSlug} src={product?.images[0]} sizes="64px" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[14px] font-bold">{product?.name ?? review.productSlug}</span>
          {editing ? null : (
            <span className="text-[#e0a800]" aria-label={`${review.rating}/5`} dir="ltr">
              {"★".repeat(review.rating)}
              <span className="text-[#d5dde5]">{"★".repeat(5 - review.rating)}</span>
            </span>
          )}
          <span className={cn("px-2 py-0.5 text-[11px] font-bold", REVIEW_STYLE[review.status])}>{d.reviewStatus[review.status]}</span>
        </div>

        {editing ? (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex gap-1 text-[26px] leading-none" dir="ltr" role="radiogroup" aria-label={t.reviews.rating}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${t.reviews.stars}`}
                  onClick={() => setRating(n)}
                  className={n <= rating ? "text-[#e0a800]" : "text-[#d5dde5] hover:text-[#e0a800]/60"}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} className="field min-h-[100px] py-3" aria-label={t.reviews.text} />
            {media.length ? (
              <div className="flex flex-wrap gap-2">
                {media.map((m) => (
                  <div key={m.url} className="relative size-16 overflow-hidden rounded-sm bg-ice">
                    {m.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="size-full object-cover" />
                    ) : (
                      <video src={`${m.url}#t=0.1`} preload="metadata" muted className="size-full object-cover" />
                    )}
                    <button
                      type="button"
                      aria-label={t.reviews.remove}
                      onClick={() => setMedia((list) => list.filter((x) => x.url !== m.url))}
                      className="absolute end-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-white/95 text-navy shadow"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={pending} className="btn btn-navy min-h-[40px] px-5 text-[13px]">
                {pending ? t.common.sending : d.saveReview}
              </button>
              <button type="button" onClick={cancel} disabled={pending} className="btn btn-ghost min-h-[40px] px-5 text-[13px]">
                {d.cancel}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-muted">{review.body}</p>
            {review.media.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {review.media.map((m) => (
                  <span key={m.url} className="relative block size-12 overflow-hidden rounded-sm bg-ice">
                    {m.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <>
                        <video src={`${m.url}#t=0.1`} preload="metadata" muted className="size-full object-cover" />
                        <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-navy/30 text-[12px] text-white">
                          ▶
                        </span>
                      </>
                    )}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
              <span className="text-[12px] text-muted">{formatDate(review.date, lang)}</span>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMessage(null);
                }}
                className="inline-flex items-center gap-1 font-bold text-navy hover:underline"
              >
                ✎ {d.editReview}
              </button>
              <button type="button" onClick={remove} disabled={pending} className="inline-flex items-center gap-1 font-bold text-danger hover:underline">
                <Icon name="trash" className="size-4" /> {d.deleteReview}
              </button>
              {product ? (
                <Link href={`${href(`/products/${review.productSlug}`)}#reviews`} className="text-muted hover:text-navy hover:underline">
                  {d.viewOnSite} →
                </Link>
              ) : null}
            </div>
          </>
        )}
        {message ? (
          <p role="status" className={cn("mt-2 text-[13px] font-bold", message.ok ? "text-success" : "text-danger")}>
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Settings({ customer, onSaved }: { customer: Customer; onSaved: (c: Customer) => void }) {
  const { t } = useI18n();
  const d = t.account.dash;
  const [profile, setProfile] = useState({ name: customer.name, phone: customer.phone, city: customer.city, address: customer.address });
  const [password, setPassword] = useState({ current: "", next: "" });
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const errorText = (e: string) =>
    e === "wrongPassword" ? d.wrongPassword : e === "passwordShort" ? t.account.errors.passwordShort : e === "invalid" ? d.invalid : t.account.errors.unavailable;

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(profile).catch(() => ({ ok: false as const, error: "unavailable" as const }));
      if (result.ok) {
        onSaved(result.customer);
        setProfileMsg({ ok: true, text: d.saved });
      } else setProfileMsg({ ok: false, text: errorText(result.error) });
    });
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changePassword(password).catch(() => ({ ok: false as const, error: "unavailable" as const }));
      if (result.ok) {
        setPassword({ current: "", next: "" });
        setPasswordMsg({ ok: true, text: d.passwordChanged });
      } else setPasswordMsg({ ok: false, text: errorText(result.error) });
    });
  }

  const field = (id: keyof typeof profile, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`acc-${id}`} className="field-label">
        {label}
      </label>
      <input
        id={`acc-${id}`}
        className="field"
        value={profile[id]}
        onChange={(e) => {
          setProfile((p) => ({ ...p, [id]: e.target.value }));
          setProfileMsg(null);
        }}
        {...props}
      />
    </div>
  );
  const message = (m: { ok: boolean; text: string } | null) =>
    m ? (
      <p role="status" className={cn("text-[13px] font-bold", m.ok ? "text-success" : "text-danger")}>
        {m.text}
      </p>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <Panel title={d.profile}>
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <p className="text-[13px] text-muted">{d.profileHint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("name", t.account.name, { required: true, minLength: 2, autoComplete: "name" })}
            <div>
              <label htmlFor="acc-email" className="field-label">
                {t.account.email}
              </label>
              <input id="acc-email" className="field opacity-70" value={customer.email} readOnly aria-describedby="acc-email-hint" />
              <p id="acc-email-hint" className="mt-1 text-[12px] text-muted">
                {d.emailLocked}
              </p>
            </div>
            {field("phone", d.phone, { type: "tel", autoComplete: "tel" })}
            {field("city", d.city, { autoComplete: "address-level2" })}
            <div className="sm:col-span-2">{field("address", d.address, { autoComplete: "street-address" })}</div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={pending} className="btn btn-navy">
              {d.save}
            </button>
            {message(profileMsg)}
          </div>
        </form>
      </Panel>

      <Panel title={d.passwordTitle}>
        <form onSubmit={savePassword} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="acc-current" className="field-label">
                {d.currentPassword}
              </label>
              <input
                id="acc-current"
                type="password"
                required
                autoComplete="current-password"
                className="field"
                value={password.current}
                onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="acc-next" className="field-label">
                {d.newPassword}
              </label>
              <input
                id="acc-next"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="field"
                value={password.next}
                onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
              />
              <p className="mt-1 text-[12px] text-muted">{t.account.passwordHint}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={pending} className="btn btn-ghost">
              {d.changePassword}
            </button>
            {message(passwordMsg)}
          </div>
        </form>
      </Panel>
    </div>
  );
}
