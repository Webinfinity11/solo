// PLACEHOLDER legal copy - must be replaced with texts reviewed by a lawyer before launch.
import type { LegalDocument } from "@/lib/types";

const updated = "2026-09-28";
const placeholder =
  "هذا نص مؤقت. ستُعَدّ الصيغة النهائية بالتعاون مع مستشار قانوني قبل إطلاق الموقع.";

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms",
    title: "الشروط والأحكام",
    updated,
    sections: [
      { id: "general", title: "أحكام عامة", paragraphs: ["باستخدامك هذا الموقع، فإنك توافق على هذه الشروط والأحكام.", placeholder] },
      { id: "eligibility", title: "الأهلية", paragraphs: ["لا يحق الشراء إلا للأشخاص الذين تبلغ أعمارهم 18 عامًا فأكثر ممن يجرون أبحاثًا مخبرية."] },
      { id: "orders", title: "الطلبات والأسعار", paragraphs: ["الأسعار قابلة للتغيير دون إشعار مسبق.", placeholder] },
      { id: "liability", title: "المسؤولية", paragraphs: ["يتحمّل المشتري المسؤولية الكاملة عن التعامل السليم مع المنتجات واستخدامها.", placeholder] },
    ],
  },
  {
    slug: "privacy",
    title: "سياسة الخصوصية",
    updated,
    sections: [
      { id: "data", title: "البيانات التي نجمعها", paragraphs: ["معلومات الاتصال والشحن اللازمة لتنفيذ طلبك.", placeholder] },
      { id: "usage", title: "كيفية استخدامنا للبيانات", paragraphs: ["تُستخدم البيانات حصرًا لمعالجة طلبك والتواصل معك.", placeholder] },
      { id: "cookies", title: "ملفات تعريف الارتباط", paragraphs: ["يستخدم هذا الموقع ملف تعريف ارتباط لتذكّر تأكيد عمرك، والتخزين المحلي لحفظ سلتك."] },
      { id: "rights", title: "حقوقك", paragraphs: ["يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها.", placeholder] },
    ],
  },
  {
    slug: "shipping-policy",
    title: "سياسة الشحن",
    updated,
    sections: [
      { id: "processing", title: "المعالجة", paragraphs: ["تُشحن الطلبات المقدّمة في أيام العمل قبل الساعة 14:00 في اليوم نفسه."] },
      { id: "delivery", title: "مدد التوصيل", paragraphs: ["تبليسي - يوم عمل واحد؛ مناطق جورجيا - 1–3 أيام؛ دوليًا - 5–10 أيام.", placeholder] },
      { id: "damage", title: "الطرود التالفة", paragraphs: ["إذا كان طردك تالفًا، فتواصل معنا خلال 48 ساعة وأرفق صورًا."] },
      { id: "international", title: "الطلبات الدولية", paragraphs: ["يتحمّل المشتري مسؤولية الامتثال لأنظمة الاستيراد المحلية وسداد أي رسوم جمركية."] },
    ],
  },
  {
    slug: "ruo-agreement",
    title: "اتفاقية الاستخدام البحثي فقط (RUO)",
    updated,
    sections: [
      { id: "purpose", title: "الاستخدام المقصود", paragraphs: ["جميع المنتجات مخصصة حصرًا للأبحاث في المختبر (in vitro) والأبحاث المخبرية."] },
      { id: "prohibited", title: "الاستخدام المحظور", paragraphs: ["المنتجات غير مخصصة للاستهلاك البشري أو الحيواني، ولا للاستخدام التشخيصي أو العلاجي، ولا كمكمّل غذائي."] },
      { id: "buyer", title: "إقرار المشتري", paragraphs: ["يؤكد المشتري أنه باحث مؤهَّل، ويملك مرافق مخبرية مناسبة، ويلتزم بمعايير السلامة."] },
      { id: "responsibility", title: "المسؤولية", paragraphs: ["SOLO Research ليست صيدلية، ولا تتحمّل أي مسؤولية عن الاستخدام غير السليم لمنتجاتها.", placeholder] },
    ],
  },
];
