// English product copy: scientific context only — no usage or dosing guidance.
import type { ProductKind } from "@/data/products";

export const kindText: Record<ProductKind, { form: string; storage: string; appearance: string }> = {
  lyophilized: {
    form: "Lyophilized powder",
    storage: "2–8°C, protected from light",
    appearance: "White to off-white powder",
  },
  solution: {
    form: "Sterile solution",
    storage: "15–25°C; 2–8°C after opening",
    appearance: "Clear, colorless liquid",
  },
};

export const productText: Record<string, { shortDescription: string; description: string }> = {
  retatrutide: {
    shortDescription: "Triple agonist of the GIP, GLP-1 and glucagon receptors.",
    description:
      "Retatrutide is a synthetic peptide that simultaneously activates the GIP, GLP-1 and glucagon receptors. It is under active investigation in research models of energy balance and lipid metabolism.\n\nSupplied as a lyophilized powder with a lot-specific Certificate of Analysis.",
  },
  tirzepatide: {
    shortDescription: "Dual agonist of the GIP and GLP-1 receptors.",
    description:
      "Tirzepatide is a 39-amino-acid synthetic peptide that acts as a dual agonist of the GIP and GLP-1 receptors. It is used in research on incretin signaling and glucose homeostasis.\n\nSupplied as a lyophilized powder.",
  },
  semaglutide: {
    shortDescription: "Long-acting GLP-1 receptor agonist.",
    description:
      "Semaglutide is a GLP-1 analogue modified with a fatty-acid side chain, which enables albumin binding and an extended half-life. It is widely used in research on GLP-1 receptor pharmacology.\n\nSupplied as a lyophilized powder.",
  },
  "aod-9604": {
    shortDescription: "Analogue of the C-terminal fragment (176–191) of growth hormone.",
    description:
      "AOD-9604 is a modified analogue of fragment 176–191 of human growth hormone, studied in research models of lipid metabolism.\n\nSupplied as a lyophilized powder.",
  },
  tesamorelin: {
    shortDescription: "Synthetic GHRH analogue.",
    description:
      "Tesamorelin is a stabilized analogue of growth hormone–releasing hormone (GHRH), studied in research on the hypothalamic–pituitary axis.\n\nSupplied as a lyophilized powder.",
  },
  ipamorelin: {
    shortDescription: "Selective ghrelin receptor agonist.",
    description:
      "Ipamorelin is a pentapeptide and a selective agonist of the ghrelin receptor (GHS-R1a). It is used in research on the regulation of secretion.\n\nSupplied as a lyophilized powder.",
  },
  "cjc-1295-no-dac": {
    shortDescription: "Modified GRF (1–29), without DAC.",
    description:
      "CJC-1295 (No DAC), also known as Modified GRF (1–29), is a 29-amino-acid GHRH analogue with four amino acid substitutions that increase enzymatic stability.\n\nSupplied as a lyophilized powder.",
  },
  "bpc-157": {
    shortDescription: "Synthetic 15-amino-acid pentadecapeptide.",
    description:
      "BPC-157 is a synthetic peptide whose sequence is derived from a fragment of a gastric juice protein. It is studied in preclinical models of tissue repair and angiogenesis.\n\nSupplied as a lyophilized powder.",
  },
  "tb-500": {
    shortDescription: "Synthetic analogue of thymosin β4.",
    description:
      "TB-500 is a synthetic peptide related to thymosin β4, studied in research on actin polymerization and cell migration.\n\nSupplied as a lyophilized powder.",
  },
  "ghk-cu": {
    shortDescription: "Copper complex of the tripeptide GHK.",
    description:
      "GHK-Cu is a complex of the naturally occurring tripeptide glycyl-histidyl-lysine with a copper(II) ion. It is studied in research on the extracellular matrix and gene expression.\n\nSupplied as a lyophilized powder.",
  },
  "nad-plus": {
    shortDescription: "Nicotinamide adenine dinucleotide — a key redox coenzyme.",
    description:
      "NAD+ is a coenzyme involved in cellular respiration, sirtuin activity and DNA repair processes. It is used in research on cellular metabolism.\n\nSupplied as a lyophilized powder.",
  },
  "mots-c": {
    shortDescription: "Peptide encoded by the mitochondrial genome.",
    description:
      "MOTS-C is a 16-amino-acid peptide encoded within the mitochondrial 12S rRNA region. It is studied in research on mitochondrial–nuclear signaling.\n\nSupplied as a lyophilized powder.",
  },
  glutathione: {
    shortDescription: "Tripeptide γ-Glu-Cys-Gly — a cellular antioxidant.",
    description:
      "Glutathione is an endogenous tripeptide and one of the principal regulators of cellular redox balance. It is used in research on oxidative stress.\n\nSupplied as a lyophilized powder.",
  },
  selank: {
    shortDescription: "Synthetic heptapeptide analogue of tuftsin.",
    description:
      "Selank is a synthetic analogue of tuftsin (Thr-Lys-Pro-Arg) with an additional Pro-Gly-Pro fragment for stability. It is studied in neuroscience research.\n\nSupplied as a lyophilized powder.",
  },
  "melanotan-1": {
    shortDescription: "Synthetic analogue of α-MSH (afamelanotide).",
    description:
      "Melanotan-I is a linear synthetic analogue of α-melanocyte-stimulating hormone and an MC1 receptor agonist. It is used in research on melanogenesis.\n\nSupplied as a lyophilized powder.",
  },
  "melanotan-2": {
    shortDescription: "Cyclic synthetic analogue of α-MSH.",
    description:
      "Melanotan-II is a cyclic analogue of α-MSH and a non-selective melanocortin receptor agonist. It is used in research on the melanocortin system.\n\nSupplied as a lyophilized powder.",
  },
  "bac-water": {
    shortDescription: "Sterile water with 0.9% benzyl alcohol.",
    description:
      "Bacteriostatic water is sterile water for injection with 0.9% benzyl alcohol added to inhibit bacterial growth. It is used for the laboratory reconstitution of lyophilized compounds.\n\nSupplied in multi-use vials.",
  },
};
