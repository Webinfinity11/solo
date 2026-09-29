"use client";

import { useState } from "react";
import type { AdminReview } from "@/lib/reviews";
import { deleteReview, setReviewStatus } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { useSave } from "./ui";

const STATUS = {
  pending: { label: "მოლოდინში", className: "bg-[#fff4d6] text-[#8a6100]" },
  approved: { label: "დამტკიცებული", className: "bg-[#eaf5ef] text-success" },
  rejected: { label: "უარყოფილი", className: "bg-mist text-muted" },
} as const;

export function ReviewsModeration({ reviews, productNames }: { reviews: AdminReview[]; productNames: Record<string, string> }) {
  const [filter, setFilter] = useState<AdminReview["status"] | "all">("pending");
  const { save, pending, status } = useSave();
  const visible = reviews.filter((r) => filter === "all" || r.status === filter);
  const count = (s: AdminReview["status"]) => reviews.filter((r) => r.status === s).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("adm-btn", filter === f && "adm-btn-primary")}>
            {f === "all" ? `ყველა (${reviews.length})` : `${STATUS[f].label} (${count(f)})`}
          </button>
        ))}
        {status && !status.ok ? <p className="text-[13px] font-bold text-danger">{status.message}</p> : null}
      </div>

      {visible.length === 0 ? <p className="adm-card text-[14px] text-muted">შეფასებები არ არის.</p> : null}
      <ul className="flex flex-col gap-3">
        {visible.map((r) => (
          <li key={r.id} className="adm-card">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
              <span className="font-bold">{productNames[r.productSlug] ?? r.productSlug}</span>
              <span className="text-[#e0a800]" aria-label={`${r.rating}/5`}>
                {"★".repeat(r.rating)}
                <span className="text-line">{"★".repeat(5 - r.rating)}</span>
              </span>
              <span className={cn("px-2 py-0.5 text-[11px] font-bold", STATUS[r.status].className)}>{STATUS[r.status].label}</span>
              <span className="text-muted">
                {r.name} · {r.email} · {r.lang.toUpperCase()} · {r.date}
              </span>
            </div>
            <p className="whitespace-pre-line text-[14px] leading-relaxed">{r.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== "approved" ? (
                <button type="button" disabled={pending} className="adm-btn adm-btn-primary" onClick={() => save(() => setReviewStatus(r.id, "approved"))}>
                  დამტკიცება
                </button>
              ) : null}
              {r.status !== "rejected" ? (
                <button type="button" disabled={pending} className="adm-btn" onClick={() => save(() => setReviewStatus(r.id, "rejected"))}>
                  {r.status === "approved" ? "დამალვა" : "უარყოფა"}
                </button>
              ) : null}
              <button
                type="button"
                disabled={pending}
                className="adm-btn adm-btn-danger"
                onClick={() => window.confirm("წავშალო შეფასება სამუდამოდ?") && save(() => deleteReview(r.id))}
              >
                წაშლა
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
