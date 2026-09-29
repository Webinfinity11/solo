import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Label + control + error message wrapper shared by all forms.
export function Field({ id, label, error, required, children, className }: { id: string; label: string; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormSuccess({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-3 border-s-[3px] border-success bg-[#eaf5ef] px-4 py-3.5 text-[14px] leading-relaxed text-success">
      {children}
    </p>
  );
}
