// Site-wide settings. Contact details are placeholders until supplied.
export const site = {
  // Catalogue mode: false hides add-to-cart, the cart and checkout everywhere.
  // Set to true to turn the shop back on.
  shopEnabled: true,
  name: "SOLO Research",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://soloresearch.ge",
  currency: "GEL",
  currencySymbol: "₾",
  freeShippingThreshold: 200,
  email: "info@soloresearch.ge",
  hours: { ka: "ორშ–პარ · 10:00–19:00", en: "Mon–Fri · 10:00–19:00", ru: "Пн–Пт · 10:00–19:00", ar: "الاثنين–الجمعة · 10:00–19:00" },
  defaultCountry: { ka: "საქართველო", en: "Georgia", ru: "Грузия", ar: "جورجيا" },
  social: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "Telegram", href: "#" },
  ],
};
