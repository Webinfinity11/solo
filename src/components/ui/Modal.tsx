"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

// Native <dialog>: focus trap, Escape and top-layer come from the browser.
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  variant = "center",
  className,
  closeLabel = "Close",
  header,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  variant?: "center" | "drawer";
  className?: string;
  closeLabel?: string;
  header?: ReactNode;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Opening uses the CSS enter animation; closing first plays the exit animation
  // (data-closing, see globals.css) and only then closes the native dialog.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (!dialog.open) return;
    dialog.setAttribute("data-closing", "");
    const timer = window.setTimeout(() => {
      dialog.close();
      dialog.removeAttribute("data-closing");
    }, 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-variant={variant}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (!dismissible || e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-48px)] max-w-[calc(100vw-32px)] overflow-auto rounded border border-line bg-white p-0 text-navy shadow-[0_24px_100px_rgba(0,18,32,.3)] open:animate-dialog-in",
        variant === "drawer" &&
          "mr-0 h-dvh max-h-dvh w-[440px] max-w-full rounded-none border-y-0 border-r-0 open:flex open:flex-col open:animate-drawer-in",
        variant === "center" && "w-[680px]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:px-7 sm:py-5">
        {header ?? (
          <div>
            {eyebrow ? <p className="eyebrow mb-1 text-[10px]">{eyebrow}</p> : null}
            <h2 className="text-[22px] font-bold leading-tight tracking-[-.03em] sm:text-[24px]">{title}</h2>
          </div>
        )}
        {dismissible ? (
          <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-9 shrink-0 place-items-center rounded-sm transition-colors hover:bg-ice">
            <Icon name="close" />
          </button>
        ) : null}
      </div>
      {children}
    </dialog>
  );
}
