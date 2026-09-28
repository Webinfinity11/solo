import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans, Noto_Sans_Georgian, Oswald } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { I18nProvider } from "@/i18n/provider";
import { getCategories, getProducts } from "@/lib/api";
import { site } from "@/data/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgeGate } from "@/components/layout/AgeGate";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CatalogProvider } from "@/components/layout/CatalogProvider";
import { StoreHydrator } from "@/components/layout/StoreHydrator";

const georgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "700"],
  variable: "--font-georgian",
  display: "swap",
});


// Latin + Cyrillic (English/Russian); comes first in the font stack, Georgian glyphs fall through to Noto Sans Georgian.
const notoSans = Noto_Sans({ subsets: ["cyrillic", "latin"], weight: ["400", "700"], variable: "--font-cyrillic", display: "swap" });

// Condensed face matching the logo lettering; used on vector product labels.
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-label", display: "swap" });

/** TBC Contractica (Georgian + Mtavruli + Latin) — headings and small uppercase labels only. */
const contractica = localFont({
  variable: "--font-tbc",
  display: "swap",
  // No Arial-based fallback face: it would render Cyrillic headings before Noto Sans.
  adjustFontFallback: false,
  src: [
    { path: "../../fonts/TBCContractica-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/TBCContractica-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../fonts/TBCContractica-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../fonts/TBCContractica-Black.ttf", weight: "900", style: "normal" },
  ],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.siteTitle, template: "%s | SOLO Research" },
    description: t.meta.siteDescription,
    openGraph: {
      siteName: "SOLO Research",
      locale: localeMeta[lang].ogLocale,
      type: "website",
      images: [{ url: "/images/site/hero-vial.webp", width: 373, height: 355 }],
    },
  };
}

export const viewport: Viewport = { themeColor: "#1A2F42" };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);
  const [products, categories] = await Promise.all([getProducts(locale), getCategories(locale)]);

  return (
    <html lang={localeMeta[locale].htmlLang} className={`${georgian.variable} ${notoSans.variable} ${oswald.variable} ${contractica.variable}`}>
      <body className="font-sans">
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <I18nProvider lang={locale}>
          <CatalogProvider products={products} categories={categories}>
            <a href="#main" className="fixed -top-20 left-5 z-[110] bg-navy px-5 py-3 text-white focus:top-3">
              {t.nav.skipToContent}
            </a>
            <AnnouncementBar t={t} />
            <Header />
            <main id="main">{children}</main>
            <Footer lang={locale} t={t} categories={categories} />
            {site.shopEnabled ? <CartDrawer /> : null}
            <AgeGate />
            <StoreHydrator />
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
