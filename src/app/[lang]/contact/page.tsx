import type { Metadata } from "next";
import { resolveLang } from "@/i18n/server";
import { site } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, href } = await resolveLang(params);
  return { title: t.contact.eyebrow, description: t.contact.description, alternates: { canonical: href("/contact") } };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);
  const c = t.contact;

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.description} crumbs={[{ label: t.common.home, href: href("/") }, { label: c.eyebrow }]} />
      <section className="container-site grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.4fr_.8fr]">
        <div className="border border-line p-5 sm:p-8">
          <ContactForm />
        </div>
        <aside className="flex flex-col gap-4">
          <div className="bg-navy p-6 text-white">
            <p className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em] text-blue">
              <Icon name="mail" className="size-4" /> {c.emailLabel}
            </p>
            <a href={`mailto:${site.email}`} className="text-[17px] font-bold hover:text-blue">
              {site.email}
            </a>
          </div>
          <div className="border border-line p-6">
            <p className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">
              <Icon name="clock" className="size-4" /> {c.hoursLabel}
            </p>
            <p className="text-[16px] font-bold">{site.hours}</p>
          </div>
          <div className="border border-line p-6">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">{c.socialLabel}</p>
            <ul className="flex flex-wrap gap-2">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="block border border-line px-3 py-2 text-[13px] font-bold transition-colors hover:border-navy">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[12px] text-muted">{t.common.placeholderNote}</p>
        </aside>
      </section>
    </>
  );
}
