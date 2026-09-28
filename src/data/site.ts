// Site-wide settings. Contact details are placeholders until supplied.
export const site = {
  // Catalogue mode: false hides add-to-cart, the cart and checkout everywhere.
  // Set to true to turn the shop back on.
  shopEnabled: false,
  name: "SOLO Research",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://soloresearch.ge",
  currency: "USD",
  currencySymbol: "$",
  freeShippingThreshold: 200,
  email: "info@soloresearch.ge",
  hours: "ორშ–პარ · 10:00–19:00",
  social: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "Telegram", href: "#" },
  ],
};
