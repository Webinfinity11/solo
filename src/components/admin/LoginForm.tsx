"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="adm-label">
          მომხმარებელი
        </label>
        <input id="username" name="username" required autoFocus autoComplete="username" autoCapitalize="none" className="adm-input" />
      </div>
      <div>
        <label htmlFor="password" className="adm-label">
          პაროლი
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="adm-input" />
      </div>
      {error ? <p className="text-[13px] text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
        {pending ? "მოწმდება…" : "შესვლა"}
      </button>
    </form>
  );
}
