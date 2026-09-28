"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";

// Stub: login / register forms without logic until real accounts exist.
export function AccountTabs() {
  const { t, href } = useI18n();
  const a = t.account;
  const stop = (e: React.FormEvent) => e.preventDefault();

  return (
    <div className="mx-auto max-w-[520px] border border-line bg-white p-5 sm:p-8">
      <Tabs
        tabs={[
          {
            id: "login",
            label: a.login,
            content: (
              <form onSubmit={stop} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="login-email" className="field-label">{a.email}</label>
                  <input id="login-email" type="email" autoComplete="email" className="field" />
                </div>
                <div>
                  <label htmlFor="login-password" className="field-label">{a.password}</label>
                  <input id="login-password" type="password" autoComplete="current-password" className="field" />
                </div>
                <Link href={href("/contact")} className="self-end text-[13px] text-muted underline underline-offset-4">
                  {a.forgot}
                </Link>
                <button type="submit" disabled className="btn btn-navy">
                  <Icon name="lock" className="size-[18px]" /> {a.login}
                </button>
              </form>
            ),
          },
          {
            id: "register",
            label: a.register,
            content: (
              <form onSubmit={stop} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reg-name" className="field-label">{a.name}</label>
                  <input id="reg-name" autoComplete="name" className="field" />
                </div>
                <div>
                  <label htmlFor="reg-email" className="field-label">{a.email}</label>
                  <input id="reg-email" type="email" autoComplete="email" className="field" />
                </div>
                <div>
                  <label htmlFor="reg-password" className="field-label">{a.password}</label>
                  <input id="reg-password" type="password" autoComplete="new-password" className="field" />
                </div>
                <label className="flex items-start gap-3 text-[13px] leading-relaxed">
                  <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-navy" />
                  {a.confirm}
                </label>
                <button type="submit" disabled className="btn btn-navy">
                  {a.register}
                </button>
              </form>
            ),
          },
        ]}
      />
      <p className="mt-2 flex gap-3 border-l-[3px] border-blue bg-ice px-4 py-3 text-[13px] leading-relaxed">
        <Icon name="info" className="size-5" /> {a.notice}
      </p>
    </div>
  );
}
