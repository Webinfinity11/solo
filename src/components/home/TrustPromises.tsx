import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { mtavruli } from "@/lib/utils";

const visuals: { image: string; icon: IconName; path: string }[] = [
  { image: "/images/site/promise-testing.webp", icon: "flask", path: "/quality" },
  { image: "/images/site/promise-coa.webp", icon: "file", path: "/coa" },
  { image: "/images/site/promise-cold.webp", icon: "snowflake", path: "/quality" },
  { image: "/images/site/promise-delivery.webp", icon: "truck", path: "/shipping" },
];

export function TrustPromises({ t, href }: { t: Dictionary; href: (p: string) => string }) {
  return (
    <section aria-labelledby="promises-title" className="relative isolate overflow-hidden bg-navy py-14 text-white sm:py-16">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0,rgba(177,212,244,.13),transparent_67%)]" />
      <div className="container-site">
        <div className="mb-9 text-center">
          <p className="eyebrow mb-2.5 text-blue">{mtavruli(t.home.promises.eyebrow)}</p>
          <h2 id="promises-title" className="mx-auto max-w-[560px] text-[28px] font-bold leading-[1.18] tracking-[-.03em] text-balance sm:text-[34px]">
            {t.home.promises.title}
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.promises.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 110} className="flex min-w-0">
              <article className="flex min-w-0 flex-1 flex-col border border-blue/40 bg-navy/20 transition duration-300 hover:-translate-y-1 hover:border-blue">
                <div className="group relative aspect-[1.83]">
                  <div className="absolute inset-0 overflow-hidden">
                    <Image src={visuals[i].image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <span className="absolute -bottom-6 start-5 grid size-[60px] place-items-center rounded-full bg-navy">
                    <Icon name={visuals[i].icon} className="size-7 text-ice" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-6 pt-10">
                  <h3 className="mb-3 text-[17px] font-bold leading-snug tracking-[-.015em]">
                    {i + 1}. {item.title}
                  </h3>
                  <p className="mb-6 text-[14px] leading-[1.65] text-white/80">{item.text}</p>
                  <Link href={href(visuals[i].path)} className="text-link mt-auto text-white">
                    {item.link} <Icon name="arrow" className="size-5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
