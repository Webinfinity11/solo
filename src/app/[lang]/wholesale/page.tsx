import type { Metadata } from "next";
import { resolveLang } from "@/i18n/server";
import { PageHero } from "@/components/ui/PageHero";
import { Icon, type IconName } from "@/components/ui/Icon";
import { WholesaleForm } from "@/components/forms/WholesaleForm";

const icons: IconName[] = ["growth", "box", "user"];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t, alternates } = await resolveLang(params);
  return { title: t.wholesale.eyebrow, description: t.wholesale.description, alternates: alternates("/wholesale") };
}

export default async function WholesalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { t, href } = await resolveLang(params);
  const w = t.wholesale;

  return (
    <>
      <PageHero eyebrow={w.eyebrow} title={w.title} description={w.description} crumbs={[{ label: t.common.home, href: href("/") }, { label: w.eyebrow }]} />
      <section className="container-site py-12 sm:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {w.benefits.map((b, i) => (
            <article key={b.title} className="border border-line p-6">
              <span className="hex-shape mb-4 grid h-[52px] w-[45px] place-items-center bg-navy text-ice">
                <Icon name={icons[i]} className="size-6" />
              </span>
              <h2 className="mb-2 text-[17px] font-bold">{b.title}</h2>
              <p className="text-[14px] leading-[1.75] text-muted">{b.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-mist py-12 sm:py-14">
        <div className="container-site grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <h2 className="mb-4 text-[24px] font-bold tracking-[-.03em]">{w.tiersTitle}</h2>
            <div className="overflow-hidden border border-line bg-white">
              <table className="w-full border-collapse text-start text-[14px]">
                <thead className="bg-navy text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{w.tiersHead.tier}</th>
                    <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{w.tiersHead.volume}</th>
                    <th scope="col" className="px-4 py-3 text-[12px] uppercase tracking-[.08em]">{w.tiersHead.discount}</th>
                  </tr>
                </thead>
                <tbody>
                  {w.tiers.map((tier) => (
                    <tr key={tier.tier} className="border-t border-line">
                      <th scope="row" className="px-4 py-3.5 font-bold">{tier.tier}</th>
                      <td className="px-4 py-3.5 text-muted">{tier.volume}</td>
                      <td className="px-4 py-3.5 font-bold">{tier.discount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-muted">{t.common.placeholderNote}</p>
          </div>
          <div className="border border-line bg-white p-5 sm:p-8">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-.03em]">{w.formTitle}</h2>
            <WholesaleForm />
          </div>
        </div>
      </section>
    </>
  );
}
