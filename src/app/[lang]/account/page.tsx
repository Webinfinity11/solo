import type { Metadata } from "next";
import { resolveLang } from "@/i18n/server";
import { PageHero } from "@/components/ui/PageHero";
import { AccountTabs } from "@/components/forms/AccountTabs";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await resolveLang(params);
  return { title: t.account.eyebrow, robots: { index: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);
  return (
    <>
      <PageHero eyebrow={t.account.eyebrow} title={t.account.title} crumbs={[{ label: t.common.home, href: href("/") }, { label: t.account.eyebrow }]} />
      <section className="container-site py-12 sm:py-14">
        <AccountTabs />
      </section>
    </>
  );
}
