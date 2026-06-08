import type {
  ContractDuration,
  ContractServiceId,
  ContractServiceOption,
} from "./types"

export type ContractServiceDef = {
  id: ContractServiceId
  order: number
  listLabel: string
  detailTitle: string
  detailBody: string
}

export const CONTRACT_SERVICES: ContractServiceDef[] = [
  {
    id: "seo",
    order: 1,
    listLabel: "تحسين محركات البحث (SEO)",
    detailTitle: "1. تحسين محركات البحث (SEO)",
    detailBody:
      "يلتزم الطرف الأول بتقديم خدمات تحسين ظهور موقع الطرف الثاني في محركات البحث (SEO)، بما يشمل الأرشفة الكلية وتحسين الكلمات المفتاحية والتكامل الاصطناعي والتعديلات التقنية وكافة المتطلبات الفنية الخاصة بتحسين ظهور العلامة التجارية داخل محركات البحث وجوجل، وبناءً عليه يرغب الطرف الثاني بالتعاقد مع الطرف الأول لتطوير وصول موقعه للجمهور المستهدف عضوياً.",
  },
  {
    id: "ads",
    order: 2,
    listLabel: "إدارة الحملات الإعلانية (ADS)",
    detailTitle: "2. إدارة الحملات الإعلانية (ADS)",
    detailBody:
      "يقوم الطرف الأول بتخطيط وإدارة الحملات الإعلانية الممولة على المنصات المتفق عليها، وتجهيز المحتوى الإعلاني واستهداف الجمهور، وقد أبدى الطرف الثاني رغبته في التعاقد لضمان كفاءة الإنفاق الإعلاني وتحقيق أعلى عائد استثماري.",
  },
  {
    id: "smm",
    order: 3,
    listLabel: "إدارة منصات السوشيال ميديا (SMM)",
    detailTitle: "3. إدارة منصات السوشيال ميديا (SMM)",
    detailBody:
      "يتولى الطرف الأول مسؤولية إدارة حسابات التواصل الاجتماعي الخاصة بالطرف الثاني، من خلال صناعة المحتوى وجدولة المنشورات والتفاعل مع المتابعين، ويرغب الطرف الثاني بالتعاقد لتعزيز هويته الرقمية وبناء مجتمع متفاعل حول علامته التجارية.",
  },
  {
    id: "ecommerce",
    order: 4,
    listLabel: "إدارة المتاجر الإلكترونية",
    detailTitle: "4. إدارة المتاجر الإلكترونية",
    detailBody:
      "يلتزم الطرف الأول بالإشراف التقني والفني على متجر الطرف الثاني، بما يشمل رفع المنتجات، وتحديث البيانات، وتحسين تجربة العميل، وبناءً عليه تعاقد الطرف الثاني مع الطرف الأول لضمان سير العمليات التشغيلية للمتجر باحترافية.",
  },
  {
    id: "graphic",
    order: 5,
    listLabel: "تصميم الجرافيك",
    detailTitle: "5. تصميم الجرافيك",
    detailBody:
      "يقوم الطرف الأول بابتكار وتنفيذ كافة التصاميم البصرية والهويات الإبداعية التي يطلبها الطرف الثاني وفق المعايير الفنية المتفق عليها، وقد اختار الطرف الثاني التعاقد مع الطرف الأول لما يمتلكه من خبرة في إخراج المحتوى البصري للمشروع.",
  },
  {
    id: "reels",
    order: 6,
    listLabel: "صناعة فيديوهات ريلز",
    detailTitle: "6. صناعة فيديوهات ريلز",
    detailBody:
      "يلتزم الطرف الأول بإنتاج ومونتاج مقاطع فيديو قصيرة (Reels) بأسلوب احترافي يناسب طبيعة نشاط الطرف الثاني، ويرغب الطرف الثاني بالتعاقد لاستخدام هذا النوع من المحتوى في زيادة الوصول والتفاعل السريع مع الجمهور.",
  },
  {
    id: "web",
    order: 7,
    listLabel: "برمجة المواقع الإلكترونية",
    detailTitle: "7. برمجة المواقع الإلكترونية",
    detailBody:
      "يتولى الطرف الأول مهمة تطوير وبناء الموقع الإلكتروني (أو النظام البرمجي) للطرف الثاني وفق المتطلبات التقنية المحددة، وقد اتفق الطرف الثاني مع الطرف الأول على تنفيذ هذا المشروع البرمجي لضمان الجودة والأمان وسرعة الأداء.",
  },
  {
    id: "reports",
    order: 8,
    listLabel: "التقارير والاستشارات الرقمية",
    detailTitle: "8. التقارير والاستشارات الرقمية",
    detailBody:
      "يلتزم الطرف الأول بتزويد الطرف الثاني بتقارير دورية تحليلية لأداء كافة الخدمات الرقمية مع تقديم توصيات استراتيجية للنمو، وبناءً عليه يرغب الطرف الثاني بالتعاقد للحصول على رؤية دقيقة تسهم في اتخاذ القرارات التسويقية الصحيحة.",
  },
]

export const CONTRACT_DURATION_OPTIONS: ContractDuration[] = [
  "3_months",
  "6_months",
  "12_months",
  "1_year",
]

const DURATION_AR: Record<ContractDuration, string> = {
  "3_months": "ثلاثة أشهر",
  "6_months": "ستة أشهر",
  "12_months": "اثني عشر شهراً",
  "1_year": "سنة واحدة",
}

const DURATION_EN: Record<ContractDuration, string> = {
  "3_months": "3 months",
  "6_months": "6 months",
  "12_months": "12 months",
  "1_year": "1 year",
}

export function formatDurationAr(duration: ContractDuration): string {
  return DURATION_AR[duration] ?? duration
}

export function formatDurationEn(duration: ContractDuration): string {
  return DURATION_EN[duration] ?? duration
}

/** @deprecated Use formatDurationAr — kept for legacy month numbers in preview drafts */
export function formatDurationMonthsAr(months: number): string {
  if (months === 3) return DURATION_AR["3_months"]
  if (months === 6) return DURATION_AR["6_months"]
  if (months === 12) return DURATION_AR["12_months"]
  return `${months} أشهر`
}

export function splitContractParagraphLines(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const parts = trimmed
    .split(/(?<=[.،؛])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length > 0 ? parts : [trimmed]
}

export function getServiceDef(id: ContractServiceId) {
  return CONTRACT_SERVICES.find((s) => s.id === id)
}

export function resolveSelectedContractServices(
  serviceIds: ContractServiceId[],
  catalog: ContractServiceOption[],
): ContractServiceOption[] {
  const byId = new Map<string, ContractServiceOption>()

  for (const service of catalog) {
    byId.set(String(service.id), service)
  }

  return serviceIds.map((id) => {
    const key = String(id)
    const fromCatalog = byId.get(key)
    if (fromCatalog) return fromCatalog

    return {
      id: key,
      order: 999,
      listLabel: `خدمة #${key}`,
      detailTitle: `خدمة #${key}`,
      detailBody: "",
    }
  })
}

export function formatContractDateAr(isoDate: string): string {
  if (!isoDate.trim()) return "٠٠ / ٠٠ / ٢٠٢٦"
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day} / ${month} / ${year}`
}

export function formatMoneyAr(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0
  return n.toLocaleString("ar-OM", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function formatContractAmount(amount: number, currency = "OMR"): string {
  const code = currency.trim() || "OMR"
  return `${formatMoneyAr(amount)} ${code}`
}
