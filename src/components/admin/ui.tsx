"use client";

// Small building blocks shared by the admin editors.
import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import type { ActionResult } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="adm-label">
      {children}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  className,
  hint,
  ...rest
}: { label?: string; value: string; onChange: (v: string) => void; className?: string; hint?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <input id={id} className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function NumberInput({ label, value, onChange, className, step = "any" }: { label?: string; value: number | undefined; onChange: (v: number | undefined) => void; className?: string; step?: string }) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <input
        id={id}
        type="number"
        step={step}
        min={0}
        className="adm-input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 4, className, hint, dir }: { label?: string; value: string; onChange: (v: string) => void; rows?: number; className?: string; hint?: string; dir?: "ltr" | "rtl" }) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <textarea id={id} rows={rows} dir={dir} className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Select<T extends string>({ label, value, onChange, options, className }: { label?: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <select id={id} className="adm-input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[14px]">
      <input type="checkbox" className="size-4 accent-navy" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Section({ title, children, actions, className }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("adm-card", className)}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-[16px] font-bold">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[14px] text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function LangTabs({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div role="tablist" className="inline-flex border border-line bg-white">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={value === l}
          onClick={() => onChange(l)}
          className={cn("px-4 py-2 text-[13px] font-bold", value === l ? "bg-navy text-white" : "hover:bg-mist")}
        >
          {localeMeta[l].label}
        </button>
      ))}
    </div>
  );
}

/** Runs a save action, shows its result and refreshes the page data. */
export function useSave() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(run: () => Promise<ActionResult>, onSuccess?: () => void) {
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await run();
        if (result.ok) {
          setStatus({ ok: true, message: "შენახულია ✓" });
          setDirty(false);
          onSuccess?.();
          router.refresh();
        } else setStatus({ ok: false, message: result.error });
      } catch {
        setStatus({ ok: false, message: "კავშირის შეცდომა — სცადეთ თავიდან." });
      }
    });
  }

  return { save, pending, status, dirty, markDirty: () => setDirty(true) };
}

/** Sticky bar with the save button and the last result. */
export function SaveBar({ onSave, pending, status, dirty, children }: { onSave: () => void; pending: boolean; status: { ok: boolean; message: string } | null; dirty: boolean; children?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <button type="button" onClick={onSave} disabled={pending} className="adm-btn adm-btn-primary min-w-[130px]">
        {pending ? "ინახება…" : "შენახვა"}
      </button>
      {status ? (
        <p role="status" className={cn("text-[13px] font-bold", status.ok ? "text-success" : "text-danger")}>
          {status.message}
        </p>
      ) : dirty ? (
        <p className="text-[13px] text-muted">შეუნახავი ცვლილებები</p>
      ) : null}
      <div className="ml-auto flex gap-2">{children}</div>
    </div>
  );
}

/** Uploads files straight to Vercel Blob and returns their public URLs. */
export function UploadButton({ label, accept, multiple, folder, onUploaded }: { label: string; accept: string; multiple?: boolean; folder: string; onUploaded: (urls: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const blob = await upload(`${folder}/${safe}`, file, { access: "public", handleUploadUrl: "/api/admin/upload" });
        urls.push(blob.url);
      }
      onUploaded(urls);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button type="button" className="adm-btn" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "იტვირთება…" : label}
      </button>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => handle(e.target.files)} />
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Move an item one step up or down. */
export function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
