import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { PageHero } from "@/components/ui/PageHero";
import { Icon, type IconName } from "@/components/ui/Icon";

const icons: IconName[] = ["flask", "file", "dna"];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.about.eyebrow, description: t.about.story[0], alternates: alternates("/about") };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);
  const a = t.about;

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} crumbs={[{ label: t.common.home, href: href("/") }, { label: a.eyebrow }]} />
      <section className="container-site grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 text-[16px] leading-[1.8] text-muted">
          {a.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="relative aspect-[1.83] overflow-hidden border border-line">
          <Image src="/images/site/promise-research.webp" alt="" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
        </div>
      </section>
      <section className="bg-navy py-14 text-white">
        <div className="container-site">
          <h2 className="mb-8 text-center text-[28px] font-bold tracking-[-.03em] sm:text-[32px]">{a.valuesTitle}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {a.values.map((v, i) => (
              <article key={v.title} className="border border-blue/40 p-6 text-center">
                <span className="hex-shape mx-auto mb-4 grid h-[62px] w-[54px] place-items-center bg-blue text-navy">
                  <Icon name={icons[i]} className="size-7" />
                </span>
                <h3 className="mb-2 text-[19px] font-bold">{v.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/80">{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container-site py-14">
        <div className="flex flex-col items-start justify-between gap-6 border-s-[3px] border-blue bg-ice p-6 sm:p-8 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-[24px] font-bold tracking-[-.03em]">{a.qualityTitle}</h2>
            <p className="text-[15px] text-muted">{a.qualityText}</p>
          </div>
          <Link href={href("/quality")} className="btn btn-navy shrink-0">
            {a.qualityCta} <Icon name="arrow" className="size-[18px]" />
          </Link>
        </div>
      </section>
    </>
  );
}
