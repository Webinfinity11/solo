import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { localePath, type Locale } from "@/i18n/config";
import type { CategoryWithCount } from "@/lib/api";
import { site } from "@/data/site";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

const FOOTER_HIDDEN_CATEGORIES = ["melanocortins", "lab-supplies"];

export function Footer({ lang, t, categories }: { lang: Locale; t: Dictionary; categories: CategoryWithCount[] }) {
  const href = (path: string) => localePath(lang, path);
  const columns = [
    {
      title: t.footer.catalog,
      // Short list so the column stays compact; the full list lives in the header dropdown.
      links: categories
        .filter((c) => !FOOTER_HIDDEN_CATEGORIES.includes(c.slug))
        .map((c) => ({ href: href(`/category/${c.slug}`), label: c.name })),
    },
    {
      title: t.footer.company,
      links: [
        { href: href("/about"), label: t.nav.about },
        { href: href("/quality"), label: t.quality.eyebrow },
        { href: href("/shipping"), label: t.nav.shipping },
        { href: href("/wholesale"), label: t.nav.wholesale },
        { href: href("/coa"), label: t.nav.labResults },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { href: href("/contact"), label: t.nav.contact },
        { href: href("/faq"), label: t.nav.faq },
        { href: href("/account"), label: t.nav.account },
        ...(site.shopEnabled ? [{ href: href("/account"), label: t.footer.trackOrder }] : []),
      ],
    },
  ];

  return (
    <footer className="bg-navy pb-7 pt-12 text-white">
      <div className="container-site">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-3 lg:grid-cols-[1.25fr_1fr_.8fr_.8fr_1.4fr] lg:gap-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href={href("/")} aria-label="SOLO Research">
              <Logo variant="light" className="mb-5" />
            </Link>
            <p className="max-w-[260px] text-[13px] leading-[1.7] text-white/75">{t.footer.tagline}</p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 text-[14px] font-bold">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-white/72 transition-colors hover:text-blue">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="mb-2 text-[14px] font-bold">{t.footer.newsletterTitle}</h3>
            <p className="mb-4 text-[12px] leading-[1.7] text-white/65">{t.footer.newsletterText}</p>
            <NewsletterForm />
            <p className="mt-5 text-[12px] text-white/65">
              <a href={`mailto:${site.email}`} className="hover:text-blue">
                {site.email}
              </a>
              <br />
              {site.hours[lang]}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-blue/25 pt-6">
          <p className="mb-5 text-[11px] leading-[1.7] text-white/65">{t.footer.disclaimer}</p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[12px] text-white/75">
              © {new Date().getFullYear()} SOLO Research. {t.footer.rights}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {t.footer.legal.map((item) => (
                <li key={item.slug}>
                  <Link href={href(`/legal/${item.slug}`)}className="text-[12px] text-white/75 transition-colors hover:text-blue">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
