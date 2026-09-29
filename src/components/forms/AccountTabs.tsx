"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { loginCustomer, logoutCustomer, registerCustomer, type AccountResult } from "@/lib/customers/actions";
import { useCustomer } from "@/components/account/useCustomer";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";

export function AccountTabs() {
  const { t, href } = useI18n();
  const a = t.account;
  const { customer, setCustomer, loaded } = useCustomer();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<AccountResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) setCustomer(result.customer);
        else setError(a.errors[result.error]);
      } catch {
        setError(a.errors.unavailable);
      }
    });
  }

  function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(() => loginCustomer({ email: String(f.get("email")), password: String(f.get("password")) }));
  }

  function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(() => registerCustomer({ name: String(f.get("name")), email: String(f.get("email")), password: String(f.get("password")), confirm: f.get("confirm") === "on" }));
  }

  const errorBox = error ? (
    <p role="alert" className="field-error mt-0 text-[13px]">
      {error}
    </p>
  ) : null;

  if (!loaded) return <div className="mx-auto min-h-[420px] max-w-[520px] border border-line bg-white" aria-busy="true" />;

  if (customer) {
    return (
      <AccountDashboard
        customer={customer}
        onCustomer={setCustomer}
        onLogout={() =>
          startTransition(async () => {
            await logoutCustomer();
            setCustomer(null);
          })
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[520px] border border-line bg-white p-5 sm:p-8">
      <Tabs
        tabs={[
          {
            id: "login",
            label: a.login,
            content: (
              <form onSubmit={onLogin} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="login-email" className="field-label">{a.email}</label>
                  <input id="login-email" name="email" type="email" required autoComplete="email" className="field" />
                </div>
                <div>
                  <label htmlFor="login-password" className="field-label">{a.password}</label>
                  <input id="login-password" name="password" type="password" required autoComplete="current-password" className="field" />
                </div>
                <Link href={href("/contact")} className="self-end text-[13px] text-muted underline underline-offset-4">
                  {a.forgot}
                </Link>
                {errorBox}
                <button type="submit" disabled={pending} className="btn btn-navy">
                  <Icon name="lock" className="size-[18px]" /> {pending ? t.common.sending : a.login}
                </button>
              </form>
            ),
          },
          {
            id: "register",
            label: a.register,
            content: (
              <form onSubmit={onRegister} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reg-name" className="field-label">{a.name}</label>
                  <input id="reg-name" name="name" required minLength={2} autoComplete="name" className="field" />
                </div>
                <div>
                  <label htmlFor="reg-email" className="field-label">{a.email}</label>
                  <input id="reg-email" name="email" type="email" required autoComplete="email" className="field" />
                </div>
                <div>
                  <label htmlFor="reg-password" className="field-label">{a.password}</label>
                  <input id="reg-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field" />
                  <p className="mt-1 text-[12px] text-muted">{a.passwordHint}</p>
                </div>
                <label className="flex items-start gap-3 text-[13px] leading-relaxed">
                  <input name="confirm" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-navy" />
                  {a.confirm}
                </label>
                {errorBox}
                <button type="submit" disabled={pending} className="btn btn-navy">
                  {pending ? t.common.sending : a.register}
                </button>
              </form>
            ),
          },
        ]}
      />
      <p className="mt-2 flex gap-3 border-s-[3px] border-blue bg-ice px-4 py-3 text-[13px] leading-relaxed">
        <Icon name="info" className="size-5 shrink-0" /> {a.notice}
      </p>
    </div>
  );
}
