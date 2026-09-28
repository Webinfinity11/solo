// Language-neutral category records. Names and descriptions: data/i18n/<locale>/categories.ts
export type CategoryRecord = { id: string; slug: string; order: number; icon: CategoryIcon };
export type CategoryIcon = "metabolic" | "growth" | "repair" | "longevity" | "cognitive" | "melanocortin" | "supplies";

export const categories: CategoryRecord[] = [
  { id: "c1", slug: "glp-1-metabolic", order: 1, icon: "metabolic" },
  { id: "c2", slug: "growth-hormone", order: 2, icon: "growth" },
  { id: "c3", slug: "recovery-repair", order: 3, icon: "repair" },
  { id: "c4", slug: "longevity-cellular", order: 4, icon: "longevity" },
  { id: "c5", slug: "cognitive", order: 5, icon: "cognitive" },
  { id: "c6", slug: "melanocortins", order: 6, icon: "melanocortin" },
  { id: "c7", slug: "lab-supplies", order: 7, icon: "supplies" },
];
