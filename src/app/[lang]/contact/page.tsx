import type { Metadata } from "next";
import { resolveLang } from "@/i18n/server";
import { getSettings } from "@/lib/api";
import { PageHero } from "@/components/ui/PageHero";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.contact.eyebrow, description: t.contact.description, alternates: alternates("/contact") };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t, href } = await resolveLang(params);
  const c = t.contact;
  const site = await getSettings();

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
          {site.phone ? (
            <div className="border border-line p-6">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">{c.phoneLabel}</p>
              <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="text-[17px] font-bold hover:text-blue">
                {site.phone}
              </a>
            </div>
          ) : null}
          {site.whatsapp.replace(/\D/g, "") ? (
            <a
              href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border border-[#25d366]/50 bg-[#25d366]/10 p-6 transition-colors hover:border-[#25d366]"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 shrink-0 text-[#25d366]" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.84 9.84 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
              </svg>
              <span>
                <span className="block text-[12px] font-bold uppercase tracking-[.1em] text-[#128c4a]">WhatsApp</span>
                <span className="block text-[17px] font-bold">{site.whatsapp}</span>
              </span>
            </a>
          ) : null}
          <div className="border border-line p-6">
            <p className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">
              <Icon name="clock" className="size-4" /> {c.hoursLabel}
            </p>
            <p className="text-[16px] font-bold">{site.hours[lang]}</p>
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
