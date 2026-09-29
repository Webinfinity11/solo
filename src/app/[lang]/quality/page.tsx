import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HexPattern } from "@/components/brand/HexPattern";
import { mtavruli } from "@/lib/utils";

const icons: IconName[] = ["dna", "flask", "shield", "snowflake", "box", "file"];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.quality.eyebrow, description: t.quality.description, alternates: alternates("/quality") };
}

export default async function QualityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <div className="container-site grid items-center gap-8 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <p className="eyebrow mb-3 text-blue">{mtavruli(t.quality.eyebrow)}</p>
            <h1 className="mb-5 text-[36px] font-bold leading-[1.08] tracking-[-.04em] text-balance sm:text-[50px]">{t.quality.title}</h1>
            <p className="max-w-[480px] text-[16px] leading-relaxed text-white/85">{t.quality.description}</p>
          </div>
          <div className="relative mx-auto aspect-[373/355] w-full max-w-[420px]">
            <span aria-hidden="true" className="hex -start-8 -top-6 h-[140px] w-[122px] opacity-25" />
            <Image src="/images/site/hero-vial.webp" alt="" fill sizes="420px" className="object-cover [mask-image:radial-gradient(circle,#000_55%,transparent_75%)]" />
          </div>
        </div>
      </section>

      <section className="container-site py-14 sm:py-16">
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.quality.sections.map((s, i) => (
            <li key={s.title} className="relative border border-line bg-white p-6 transition hover:border-blue">
              <span className="absolute end-5 top-5 text-[40px] font-bold leading-none tracking-[-.05em] text-ice">0{i + 1}</span>
              <span className="hex-shape mb-5 grid h-[58px] w-[50px] place-items-center bg-navy text-ice">
                <Icon name={icons[i]} className="size-6" />
              </span>
              <h2 className="mb-2.5 text-[18px] font-bold tracking-[-.015em]">{s.title}</h2>
              <p className="text-[14px] leading-[1.75] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative isolate overflow-hidden bg-ice py-14 text-center">
        <HexPattern hexes={[{ className: "start-[-3%] top-4 h-[178px] w-[158px]", opacity: 0.5 }, { className: "end-[-4%] bottom-[-60px] h-[230px] w-[200px]", opacity: 0.4 }]} />
        <div className="container-site">
          <h2 className="mb-6 text-[26px] font-bold tracking-[-.03em] sm:text-[30px]">{t.coa.title}</h2>
          <Link href={href("/coa")} className="btn btn-navy">
            {t.quality.cta} <Icon name="arrow" className="size-[18px]" />
          </Link>
        </div>
      </section>
    </>
  );
}
