import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { resolveLang } from "@/i18n/server";
import { getLegalDocument, getLegalDocuments } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";

type Params = Promise<{ lang: string; slug: string }>;

// Items added in the admin after the build are rendered on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const all = await Promise.all(locales.map(async (lang) => (await getLegalDocuments(lang)).map((d) => ({ lang, slug: d.slug }))));
  return all.flat();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, alternates } = await resolveLang(params);
  const { slug } = await params;
  const doc = await getLegalDocument(lang, slug);
  return doc ? { title: doc.title, alternates: alternates(`/legal/${slug}`) } : {};
}

export default async function LegalPage({ params }: { params: Params }) {
  const { lang, t, href } = await resolveLang(params);
  const { slug } = await params;
  const doc = await getLegalDocument(lang, slug);
  if (!doc) notFound();

  return (
    <>
      <PageHero title={doc.title} crumbs={[{ label: t.common.home, href: href("/") }, { label: doc.title }]}>
        <p className="mt-3 text-[13px] text-muted">
          {t.legal.lastUpdated}: {formatDate(doc.updated, lang)}
        </p>
      </PageHero>
      <section className="container-site grid gap-10 py-12 lg:grid-cols-[240px_1fr]">
        <nav aria-label={t.legal.toc}>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[.1em] text-eyebrow">{t.legal.toc}</p>
          <ol className="flex flex-col gap-1 border-l border-line lg:sticky lg:top-[110px]">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-[14px] text-muted transition-colors hover:border-navy hover:text-navy">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="prose-legal max-w-[760px]">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mb-9">
              <h2 className="mb-3 text-[21px] font-bold tracking-[-.02em] text-navy">
                {i + 1}. {s.title}
              </h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </article>
      </section>
    </>
  );
}
