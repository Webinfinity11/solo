// PLACEHOLDER legal copy - must be replaced with texts reviewed by a lawyer before launch.
import type { LegalDocument } from "@/lib/types";

const updated = "2026-09-28";
const placeholder =
  "This is placeholder text. The final version will be prepared together with legal counsel before the site launches.";

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms",
    title: "Terms & Conditions",
    updated,
    sections: [
      { id: "general", title: "General provisions", paragraphs: ["By using this site, you agree to these Terms & Conditions.", placeholder] },
      { id: "eligibility", title: "Eligibility", paragraphs: ["Purchases may be made only by persons aged 18 or over who conduct laboratory research."] },
      { id: "orders", title: "Orders & pricing", paragraphs: ["Prices are subject to change without prior notice.", placeholder] },
      { id: "liability", title: "Liability", paragraphs: ["The buyer accepts full responsibility for the proper handling and use of the products.", placeholder] },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated,
    sections: [
      { id: "data", title: "What data we collect", paragraphs: ["The contact and shipping information required to fulfil your order.", placeholder] },
      { id: "usage", title: "How we use data", paragraphs: ["Data is used solely to process your order and to communicate with you.", placeholder] },
      { id: "cookies", title: "Cookies", paragraphs: ["This site uses a cookie to remember your age confirmation and local storage for your cart."] },
      { id: "rights", title: "Your rights", paragraphs: ["You may request to access, correct or delete your data.", placeholder] },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    updated,
    sections: [
      { id: "processing", title: "Processing", paragraphs: ["Orders placed on business days before 14:00 ship the same day."] },
      { id: "delivery", title: "Delivery times", paragraphs: ["Tbilisi - 1 business day; regions of Georgia - 1–3 days; international - 5–10 days.", placeholder] },
      { id: "damage", title: "Damaged parcels", paragraphs: ["If your parcel is damaged, contact us within 48 hours and include photos."] },
      { id: "international", title: "International orders", paragraphs: ["The buyer is responsible for complying with local import regulations and for any customs duties."] },
    ],
  },
  {
    slug: "ruo-agreement",
    title: "Research Use Only (RUO) Agreement",
    updated,
    sections: [
      { id: "purpose", title: "Intended use", paragraphs: ["All products are intended solely for in vitro and laboratory research."] },
      { id: "prohibited", title: "Prohibited use", paragraphs: ["Products are not intended for human or animal consumption, for diagnostic or therapeutic use, or as a dietary supplement."] },
      { id: "buyer", title: "Buyer confirmation", paragraphs: ["The buyer confirms that they are a qualified researcher, have appropriate laboratory facilities and comply with safety standards."] },
      { id: "responsibility", title: "Responsibility", paragraphs: ["SOLO Research is not a pharmacy and accepts no responsibility for improper use of its products.", placeholder] },
    ],
  },
];
