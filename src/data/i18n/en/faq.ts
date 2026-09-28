import type { FaqItem } from "@/lib/types";

export const faqGroups: Record<string, string> = {
  products: "Products",
  testing: "Testing & COA",
  ordering: "Ordering & payment",
  shipping: "Shipping",
  storage: "Storage",
  legal: "Legal",
};

// `home: true` items are shown in the homepage preview.
export const faq: (FaqItem & { home?: boolean })[] = [
  {
    group: "products",
    home: true,
    question: "What are research peptides?",
    answer:
      "Research peptides are short chains of amino acids synthesized for laboratory and scientific research. They are not drugs and are not intended for clinical use.",
  },
  {
    group: "products",
    question: "In what form are products supplied?",
    answer:
      "Most peptides are supplied as a lyophilized (freeze-dried) powder in a sealed vial. Bacteriostatic water is supplied as a solution.",
  },
  {
    group: "products",
    question: "What is the difference between sizes (10mg / 20mg / 40mg)?",
    answer:
      "The size indicates the amount of compound in the vial. The compound and its purity are identical across all sizes — only the quantity differs.",
  },
  {
    group: "products",
    home: true,
    question: "Are the products intended for human consumption?",
    answer:
      "No. All products are intended for laboratory research use only. They are not intended for human or animal consumption and are not intended to diagnose, treat or prevent any disease.",
  },
  {
    group: "testing",
    home: true,
    question: "Is independent testing performed?",
    answer:
      "Yes. Every lot is tested by a third-party laboratory: HPLC for purity and mass spectrometry for identity.",
  },
  {
    group: "testing",
    question: "Where can I find the COA for my vial?",
    answer:
      "Go to the Lab Results page and search by the lot number printed on the label. A link to the COA is also available on every product page.",
  },
  {
    group: "ordering",
    question: "Which payment methods are accepted?",
    answer: "The list of payment methods will be confirmed before the site launches.",
  },
  {
    group: "ordering",
    question: "Can I change my order?",
    answer:
      "Orders can be changed or cancelled before they ship. Contact us as soon as possible and include your order number.",
  },
  {
    group: "shipping",
    home: true,
    question: "How long will my order take to arrive?",
    answer:
      "Orders placed on business days before 14:00 ship the same day. Delivery within Tbilisi takes 1 business day; to other regions, 1–3 days.",
  },
  {
    group: "shipping",
    question: "How can I track my parcel?",
    answer: "You'll receive a tracking number by email as soon as your order ships.",
  },
  {
    group: "shipping",
    question: "How is the parcel packaged?",
    answer:
      "In a plain box with no indication of the contents. Temperature-sensitive compounds ship with insulation and cold packs.",
  },
  {
    group: "shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes, international shipping is available. The buyer is responsible for complying with local regulations.",
  },
  {
    group: "storage",
    home: true,
    question: "How should peptides be stored?",
    answer:
      "Lyophilized powder is stored at 2–8°C, protected from light; for long-term storage, −20°C. Always follow the documentation for the specific lot.",
  },
  {
    group: "legal",
    question: "Why is the 21+ age requirement necessary?",
    answer:
      "This site is intended for qualified researchers. When purchasing, you confirm your age and that the products will be used for research purposes only.",
  },
  {
    group: "legal",
    home: true,
    question: "What is your return policy?",
    answer:
      "To protect product integrity, opened products or products with a broken seal cannot be returned. If your parcel arrives damaged, contact us within 48 hours.",
  },
];
