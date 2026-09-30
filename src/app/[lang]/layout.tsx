import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans, Noto_Sans_Arabic, Noto_Sans_Georgian, Oswald } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { applyOverrides } from "@/i18n/overrides";
import { getContent } from "@/lib/content/store";
import { I18nProvider } from "@/i18n/provider";
import { getCategories, getProducts, getSettings } from "@/lib/api";
import { site } from "@/data/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgeGate } from "@/components/layout/AgeGate";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CatalogProvider } from "@/components/layout/CatalogProvider";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { PromoFromUrl } from "@/components/cart/PromoField";
import { Suspense } from "react";

const georgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "700"],
  variable: "--font-georgian",
  display: "swap",
});


// Latin + Cyrillic (English/Russian); comes first in the font stack, Georgian glyphs fall through to Noto Sans Georgian.
const notoSans = Noto_Sans({ subsets: ["cyrillic", "latin"], weight: ["400", "700"], variable: "--font-cyrillic", display: "swap" });

// Arabic (right-to-left locale).
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-arabic", display: "swap" });

// Condensed face matching the logo lettering; used on vector product labels.
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-label", display: "swap" });

/** FiraGO Bold (Georgian, Latin, Cyrillic, Arabic) - headings and small uppercase labels. Body text stays Noto Sans. */
const firago = localFont({
  variable: "--font-heading",
  display: "swap",
  adjustFontFallback: false,
  src: [{ path: "../../fonts/FiraGO-Bold.woff2", weight: "700", style: "normal" }],
});

/** BPG Nino Mtavruli: capital-style Georgian drawn on the ordinary Mkhedruli code points.
 *  Limited to the Georgian range, so Latin in the same labels keeps the display font. */
const mtavruliFont = localFont({
  variable: "--font-mtavruli",
  display: "swap",
  adjustFontFallback: false,
  src: [{ path: "../../fonts/BPGNinoMtavruli-Normal.otf", weight: "400", style: "normal" }],
  declarations: [{ prop: "unicode-range", value: "U+10D0-10FF" }],
});

// true: pages revalidated from the admin are regenerated on demand (false made them 404
// after revalidatePath). Unknown languages are still rejected with notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = applyOverrides(getDictionary(lang), (await getContent()).texts[lang]);
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
  const [products, categories, settings, content] = await Promise.all([getProducts(locale), getCategories(locale), getSettings(), getContent()]);
  const overrides = content.texts[locale];
  const t = applyOverrides(getDictionary(locale), overrides);

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      dir={localeMeta[locale].dir}
      className={`${georgian.variable} ${notoSans.variable} ${arabic.variable} ${oswald.variable} ${firago.variable} ${mtavruliFont.variable}`}
    >
      <body className="font-sans">
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <I18nProvider lang={locale} overrides={overrides}>
          <CatalogProvider products={products} categories={categories}>
            <a href="#main" className="fixed -top-20 start-5 z-[110] bg-navy px-5 py-3 text-white focus:top-3">
              {t.nav.skipToContent}
            </a>
            <AnnouncementBar t={t} />
            <Header />
            <main id="main">{children}</main>
            <Footer lang={locale} t={t} categories={categories} settings={settings} />
            {site.shopEnabled ? <CartDrawer /> : null}
            <AgeGate />
            <StoreHydrator />
            {site.shopEnabled ? (
              <Suspense>
                <PromoFromUrl />
              </Suspense>
            ) : null}
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
