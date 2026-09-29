import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/i18n/server";
import { PageHero } from "@/components/ui/PageHero";
import { Icon, type IconName } from "@/components/ui/Icon";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.shipping.eyebrow, description: t.shipping.description, alternates: alternates("/shipping") };
}

export default async function ShippingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);
  const s = t.shipping;
  const blocks: { icon: IconName; title: string; text: string }[] = [
    { icon: "truck", title: s.carriersTitle, text: s.carriers },
    { icon: "snowflake", title: s.packagingTitle, text: s.packaging },
    { icon: "globe", title: s.internationalTitle, text: s.international },
  ];

  return (
    <>
      <PageHero eyebrow={s.eyebrow} title={s.title} description={s.description} crumbs={[{ label: t.common.home, href: href("/") }, { label: s.eyebrow }]} />
      <section className="container-site grid gap-10 py-12 sm:py-14 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="mb-4 flex items-center gap-3 text-[22px] font-bold tracking-[-.02em]">
            <Icon name="clock" className="size-6" /> {s.processingTitle}
          </h2>
          <ul className="space-y-3">
            {s.processing.map((line) => (
              <li key={line} className="flex gap-3 border-s-[3px] border-blue bg-ice px-4 py-3 text-[15px] leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 flex items-center gap-3 text-[22px] font-bold tracking-[-.02em]">
            <Icon name="box" className="size-6" /> {s.ratesTitle}
          </h2>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[440px] border-collapse text-start text-[14px]">
              <thead className="bg-navy text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{s.ratesHead.region}</th>
                  <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{s.ratesHead.time}</th>
                  <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{s.ratesHead.price}</th>
                </tr>
              </thead>
              <tbody>
                {s.rates.map((r) => (
                  <tr key={r.region} className="border-t border-line even:bg-mist">
                    <th scope="row" className="px-4 py-3.5 font-bold">{r.region}</th>
                    <td className="px-4 py-3.5 text-muted">{r.time}</td>
                    <td className="px-4 py-3.5">{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-muted">{t.common.placeholderNote}</p>
        </div>
      </section>
      <section className="bg-mist py-12 sm:py-14">
        <div className="container-site">
          <div className="grid gap-5 md:grid-cols-3">
            {blocks.map((b) => (
              <article key={b.title} className="border border-line bg-white p-6">
                <span className="hex-shape mb-4 grid h-[52px] w-[45px] place-items-center bg-navy text-ice">
                  <Icon name={b.icon} className="size-6" />
                </span>
                <h3 className="mb-2 text-[17px] font-bold">{b.title}</h3>
                <p className="text-[14px] leading-[1.75] text-muted">{b.text}</p>
              </article>
            ))}
          </div>
          <Link href={href("/legal/shipping-policy")} className="text-link mt-8">
            {s.policyLink} <Icon name="arrow" className="size-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
