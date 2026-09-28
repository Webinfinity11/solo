import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { HeroMotion } from "./HeroMotion";
import { mtavruli } from "@/lib/utils";

export function Hero({ t, href }: { t: Dictionary; href: (p: string) => string }) {
  const h = t.home.hero;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#020b16] text-white xl:h-[640px]">
      {/* Animated product scene behind the copy on every screen size. */}
      <div className="absolute inset-0 -z-10">
        <HeroMotion />
        {/* Overlay. Mobile/tablet: the copy sits over the vial, so the whole scene is dimmed.
            Desktop: lighter overall dim + a deep left-side shade behind the copy. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#020b16]/65 xl:bg-[#020b16]/35" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,11,22,.95)_0%,rgba(2,11,22,.82)_30%,rgba(2,11,22,.4)_52%,rgba(2,11,22,.05)_72%)] xl:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#020b16]/70 to-transparent" />
      </div>

      <div className="container-site pointer-events-none relative flex items-center xl:h-full">
        <div className="pointer-events-auto relative z-10 w-full py-10 sm:py-14 xl:max-w-[780px] xl:py-0">
          <p className="mb-4 animate-fade-up text-[11px] uppercase leading-relaxed tracking-[.3em] text-white/60 [font-family:var(--font-display)] sm:mb-5">{mtavruli(h.eyebrow)}</p>
          <h1 id="hero-title" className="animate-fade-up text-[32px] font-bold leading-[1.12] tracking-[-.035em] [animation-delay:.1s] sm:text-[46px] xl:text-[50px] 2xl:text-[54px]">
            {h.titleStart}
            <br />
            <span className="sm:whitespace-nowrap"><span className="text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.9)]">{h.titleOutline}</span> {h.titleEnd}</span>
          </h1>
          <p className="mt-4 max-w-[600px] animate-fade-up text-[15px] leading-[1.6] text-white/80 [animation-delay:.2s] sm:text-[18px]">{h.description}</p>
          <div className="mt-6 flex animate-fade-up gap-2.5 [animation-delay:.3s] sm:mt-7 sm:gap-3">
            <Link href={href("/products")} className="btn min-h-[50px] flex-1 gap-2 whitespace-nowrap bg-white px-3 text-[12px] text-navy sm:flex-none hover:bg-ice sm:min-h-[52px] sm:px-7 sm:text-[14px]">
              {h.shop} <span aria-hidden="true">→</span>
            </Link>
            <Link href={href("/quality")} className="btn min-h-[50px] flex-1 whitespace-nowrap border-white/30 px-3 text-[12px] text-white sm:flex-none hover:border-white hover:bg-white/5 sm:min-h-[52px] sm:px-7 sm:text-[14px]">
              {h.howWeTest}
            </Link>
          </div>
          <ul className="mt-7 flex max-w-full animate-fade-up gap-x-5 border-t border-white/15 pt-5 [animation-delay:.4s] sm:mt-8 sm:w-fit sm:gap-x-8">
            {h.benefits.map((b) => (
              <li key={b.title} className="min-w-0">
                <p className="text-[20px] font-bold leading-none tracking-[-.02em] sm:text-[22px]">{b.title}</p>
                <p className="mt-1.5 text-[11px] leading-snug text-white/70 sm:whitespace-nowrap sm:text-[13px]">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
