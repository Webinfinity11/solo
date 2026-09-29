import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { HeroMotion } from "./HeroMotion";
import { Icon } from "@/components/ui/Icon";
import { mtavruli } from "@/lib/utils";

/** wa.me link for an international number; without a number the button falls back to the contact page. */
function whatsappHref(number: string): string | null {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.84 9.84 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function Hero({ t, href, whatsapp }: { t: Dictionary; href: (p: string) => string; whatsapp: string }) {
  const h = t.home.hero;
  const wa = whatsappHref(whatsapp);
  const button = "btn min-h-[50px] gap-2 whitespace-nowrap px-4 text-[13px] sm:min-h-[52px] sm:px-6 sm:text-[14px]";

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#020b16] text-white xl:h-[660px]">
      {/* Animated product scene behind the copy on every screen size. */}
      <div className="absolute inset-0 -z-10">
        <HeroMotion />
        {/* Overlay. Mobile/tablet: the copy sits over the vial, so the whole scene is dimmed.
            Desktop: lighter overall dim + a deep shade behind the copy (mirrored for right-to-left). */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#020b16]/65 xl:bg-[#020b16]/35" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(2,11,22,.95)_0%,rgba(2,11,22,.82)_34%,rgba(2,11,22,.4)_56%,rgba(2,11,22,.05)_76%)] xl:block rtl:bg-[linear-gradient(270deg,rgba(2,11,22,.95)_0%,rgba(2,11,22,.82)_34%,rgba(2,11,22,.4)_56%,rgba(2,11,22,.05)_76%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#020b16]/70 to-transparent" />
      </div>

      <div className="container-site pointer-events-none relative flex items-center xl:h-full">
        <div className="pointer-events-auto relative z-10 w-full py-10 sm:py-14 xl:max-w-[800px] xl:py-0">
          <p className="mb-4 animate-fade-up text-[11px] uppercase leading-relaxed tracking-[.3em] text-white/60 [font-family:var(--font-display)] sm:mb-5">{mtavruli(h.eyebrow)}</p>

          <h1 id="hero-title" className="animate-fade-up font-bold tracking-[-.03em] [animation-delay:.1s]">
            <span className="block text-[30px] leading-[1.12] sm:text-[44px] xl:text-[50px]">{h.titleTop}</span>
            <span className="mt-2 block bg-[linear-gradient(90deg,var(--blue-accent),#ffffff_85%)] bg-clip-text text-[24px] leading-[1.2] text-transparent sm:mt-3 sm:text-[34px] xl:text-[38px] rtl:bg-[linear-gradient(270deg,var(--blue-accent),#ffffff_85%)]">
              {h.titleBottom}
            </span>
          </h1>

          <p className="mt-6 flex animate-fade-up items-center gap-3 text-[12px] font-bold uppercase leading-snug tracking-[.18em] text-blue [animation-delay:.2s] [font-family:var(--font-display)] sm:text-[13px]">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-blue/70" />
            <Icon name="truck" className="size-5 shrink-0" />
            {mtavruli(h.subtitle)}
          </p>

          <div className="mt-7 grid animate-fade-up grid-cols-2 gap-2.5 [animation-delay:.3s] sm:flex sm:flex-wrap sm:gap-3">
            <Link href={href("/products")} className={`${button} bg-white text-navy hover:bg-ice`}>
              {h.shop} <Icon name="arrow" className="size-[18px]" />
            </Link>
            <Link href={href("/coa")} className={`${button} border-white/30 text-white hover:border-white hover:bg-white/5`}>
              {h.labTests}
            </Link>
            <a
              href={wa ?? href("/contact")}
              {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${button} col-span-2 border-[#25d366]/60 text-white hover:border-[#25d366] hover:bg-[#25d366]/10`}
            >
              <WhatsAppIcon className="size-5 text-[#25d366]" /> {h.whatsapp}
            </a>
          </div>

          <dl className="mt-8 flex animate-fade-up border-t border-white/15 pt-5 [animation-delay:.4s] sm:w-fit">
            {h.benefits.map((b, i) => (
              <div key={b.label} className={i ? "border-s border-white/15 ps-6 sm:ps-8" : "pe-6 sm:pe-8"}>
                <dt className="text-[11px] uppercase tracking-[.16em] text-white/65 [font-family:var(--font-display)] sm:text-[12px]">{mtavruli(b.label)}</dt>
                <dd className="mt-1.5 text-[26px] font-bold leading-none tracking-[-.02em] sm:text-[30px]">
                  <bdi dir="auto">{b.value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
