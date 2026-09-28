import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { getFaq } from "@/lib/api";
import { PageHero } from "@/components/ui/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, href } = await resolveLang(params);
  return { title: t.faq.title, description: t.faq.description, alternates: { canonical: href("/faq") } };
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t, href } = await resolveLang(params);
  const { groups, items } = await getFaq(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero eyebrow={t.faq.eyebrow} title={t.faq.title} description={t.faq.description} crumbs={[{ label: t.common.home, href: href("/") }, { label: t.nav.faq }]} />
      <section className="container-site grid gap-10 py-12 sm:py-14 lg:grid-cols-[220px_1fr]">
        <nav aria-label={t.legal.toc} className="hidden lg:block">
          <ul className="sticky top-[110px] flex flex-col gap-1 border-l border-line">
            {Object.entries(groups).map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[14px] text-muted transition-colors hover:border-navy hover:text-navy">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex max-w-[780px] flex-col gap-10">
          {Object.entries(groups).map(([id, label]) => (
            <section key={id} id={id} aria-labelledby={`${id}-title`}>
              <h2 id={`${id}-title`} className="mb-4 text-[22px] font-bold tracking-[-.02em]">
                {label}
              </h2>
              <Accordion items={items.filter((i) => i.group === id)} className="[&_details]:border-line" />
            </section>
          ))}
          <div className="flex flex-col items-start gap-4 bg-ice p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px]">{t.faq.description}</p>
            <Link href={href("/contact")} className="btn btn-navy shrink-0">
              {t.faq.contactCta} <Icon name="arrow" className="size-[18px]" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
