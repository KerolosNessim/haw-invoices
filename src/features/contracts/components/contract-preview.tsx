import { Globe, Phone, Printer } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  formatContractAmount,
  formatContractDateAr,
  formatDurationAr,
  resolveSelectedContractServices,
  splitContractParagraphLines,
} from "../contract-content"
import type { ContractFormDraft, ContractServiceOption } from "../types"
import { printContractElement } from "../utils/download-contract"

const BRAND_GREEN = "#99C23C"
const HIGHLIGHT_YELLOW = "yellow"
const BODY_TEXT_CLASS = "text-[13px] leading-[1.85]"
const HEADING_TEXT_CLASS = "text-[13px] font-bold"
const FINGERPRINT_OPACITY = 0.07

const fingerprintSrc = () => {
  const path = `${import.meta.env.BASE_URL}finger-print.webp`.replace(/\/+/g, "/")
  if (typeof window === "undefined") return path
  return new URL(path, window.location.href).href
}

const logoSrc = () => {
  const path = `${import.meta.env.BASE_URL}logo.png`.replace(/\/+/g, "/")
  if (typeof window === "undefined") return path
  return new URL(path, window.location.href).href
}

export type ContractPreviewProps = ContractFormDraft & {
  contractNumber?: string
  className?: string
  id?: string
  serviceCatalog?: ContractServiceOption[]
}

function FingerprintWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <img
        src={fingerprintSrc()}
        alt=""
        className="max-h-[min(720px,82%)] w-auto max-w-[min(640px,92%)] object-contain select-none"
        style={{ opacity: FINGERPRINT_OPACITY }}
      />
    </div>
  )
}

function Highlight({
  children,
  active = true,
  block = false,
  className,
}: {
  children: React.ReactNode
  active?: boolean
  block?: boolean
  className?: string
}) {
  if (!active) return <>{children}</>

  const Tag = block ? "div" : "span"
  return (
    <Tag
      className={cn(
        block ? "rounded-sm px-1 py-0" : "rounded-sm px-0.5 py-px",
        className,
      )}
      style={{ backgroundColor: HIGHLIGHT_YELLOW }}
    >
      {children}
    </Tag>
  )
}

function HighlightedLines({ text }: { text: string }) {
  const lines = splitContractParagraphLines(text)

  return (
    <div className="space-y-0.5">
      {lines.map((line, index) => (
        <Highlight key={`${index}-${line.slice(0, 12)}`} block>
          {line}
        </Highlight>
      ))}
    </div>
  )
}

function ContractPageHeader() {
  return (
    <header className="contract-page-header relative z-10 shrink-0 bg-white">
      <div className="flex h-12 w-full flex-row items-stretch" dir="ltr">
        <div className="w-10 shrink-0" style={{ backgroundColor: BRAND_GREEN }} />
        <div className="flex shrink-0 items-center bg-white px-4 ps-8">
          <img
            src={logoSrc()}
            alt="Howeyah"
            className="h-[52px] w-auto object-contain"
          />
        </div>
        <div className="flex-1" style={{ backgroundColor: BRAND_GREEN }} />
      </div>
    </header>
  )
}

function ContractDocumentTitle({ contractNumber }: { contractNumber?: string }) {
  return (
    <div className="contract-doc-title px-10 pt-14 pb-2">
      <h1 className="text-center text-[18px] font-bold tracking-tight text-[#1a1a1a]">
        عقد تسويق إلكتروني
      </h1>
      {contractNumber ? (
        <p className="mt-2 text-center text-xs text-[#666]" dir="ltr">
          HWEY-CON-{contractNumber}
        </p>
      ) : null}
    </div>
  )
}

function ContractFooter() {
  return (
    <footer className="contract-page-footer relative z-10 shrink-0 bg-white">
      <div className="px-10 pb-5 pt-2" dir="ltr">
        <div className="flex items-end justify-between gap-8">
          <div className="h-px w-36 bg-[#555] sm:w-44" />
          <div className="h-px w-36 bg-[#555] sm:w-44" />
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-xs text-white sm:px-10 sm:text-sm"
        style={{ backgroundColor: BRAND_GREEN }}
        dir="ltr"
      >
        <div className="flex items-center gap-2">
          <span className="[unicode-bidi:isolate]">+968 9520 4555</span>
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <SocialIcons />
          <span className="font-medium [unicode-bidi:isolate]">@hooweyah</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="[unicode-bidi:isolate]">www.howeyah.net</span>
          <Globe className="h-4 w-4 shrink-0" aria-hidden />
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20"
      title={label}
    >
      {children}
    </span>
  )
}

function SocialIcons() {
  const iconClass = "h-3.5 w-3.5 fill-current"

  return (
    <div className="flex items-center gap-1.5">

      <SocialIcon label="TikTok">
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
        </svg>
      </SocialIcon>
      <SocialIcon label="YouTube">
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </SocialIcon>
      <SocialIcon label="X">
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </SocialIcon>
      <SocialIcon label="Instagram">
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      </SocialIcon>
      <SocialIcon label="Facebook">
        <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z" />
        </svg>
      </SocialIcon>
    </div>
  )
}

export default function ContractPreview({
  client_name,
  client_title,
  business_name,
  commercial_registration,
  service_ids,
  duration,
  monthly_amount,
  currency,
  contract_date,
  contractNumber,
  className = "",
  id,
  serviceCatalog = [],
}: ContractPreviewProps) {
  const { t } = useTranslation("translation", { keyPrefix: "contracts.preview" })

  const handlePrint = () => {
    if (!id) return
    const el = document.getElementById(id)
    if (el) printContractElement(el, `contract-${contractNumber ?? "draft"}`)
  }

  const filled = (value: string, fallback = "……………………") =>
    value.trim() || fallback

  const selectedServices = resolveSelectedContractServices(
    service_ids,
    serviceCatalog,
  )

  return (
    <div
      id={id}
      className={cn(
        "contract-print-root relative mx-auto w-full max-w-[794px] overflow-hidden bg-white text-[#1a1a1a] shadow-sm",
        className,
      )}
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: "'Segoe UI', Tahoma, 'Arial', sans-serif",
      }}
    >
      {id ? (
        <div className="border-b border-[#eee] px-6 py-3 print:hidden" data-print-hide>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#f8f8f8]"
          >
            <Printer className="h-4 w-4" aria-hidden />
            {t("print")}
          </button>
        </div>
      ) : null}

      <table className="contract-print-sheet w-full border-collapse">
        <thead className="contract-print-thead">
          <tr>
            <td className="p-0 align-top">
              <ContractPageHeader />
            </td>
          </tr>
        </thead>
        <tfoot className="contract-print-tfoot">
          <tr>
            <td className="p-0 align-top">
              <ContractFooter />
            </td>
          </tr>
        </tfoot>
        <tbody className="contract-print-tbody">
          <tr>
            <td className="relative p-0 align-top">
              <FingerprintWatermark />

              <main className={cn("contract-page-content space-y-4 px-10 pb-8 pt-0", BODY_TEXT_CLASS)}>
                <ContractDocumentTitle contractNumber={contractNumber} />

          <section className="space-y-3">
            <p>
              <strong>الطرف الأول:</strong>
              <br />
              شركة هوية للحلول الرقمية، سجل تجاري رقم (1640611)، مقرها مسقط – سلطنة
              عمان، ويمثلها المهندس/ محمود سفيان قنيطة ويُشار إليها لاحقاً في العقد
              بـ <strong>(الوكالة).</strong>
            </p>
            <p>
              <strong>الطرف الثاني:</strong>
              <br />
              <Highlight>
                {filled(client_title)} {filled(client_name)}
              </Highlight>
              ، مالك النشاط التجاري / الشركة{" "}
              <Highlight>{filled(business_name)}</Highlight>، رقم السجل التجاري (
              <Highlight>{filled(commercial_registration, "………")}</Highlight>)،
              ويُشار إليه لاحقاً في العقد بـ <strong>(العميل).</strong>
            </p>
            <p className="font-bold">تم الاتفاق بين الطرفين على ما يلي:</p>
          </section>

          <section className="space-y-3">
            <h2 className={HEADING_TEXT_CLASS}>
              المادة (1): موضوع العقد
            </h2>
            <p>
              يقوم الطرف الأول بتنفيذ خدمات التسويق الإلكتروني للطرف الثاني، وتشمل
              (حسب الباقة المتفق عليها):
            </p>
            {selectedServices.length > 0 ? (
              <ul className="list-none space-y-1 ps-1">
                {selectedServices.map((service) => (
                  <li key={service.id}>
                    <Highlight block>– {service.listLabel}</Highlight>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="space-y-3 pt-1">
              {selectedServices.map((service, index) => (
                <div key={service.id} className="space-y-1">
                  <Highlight block>
                    <p className="font-bold">
                      {index + 1}. {service.listLabel}
                    </p>
                  </Highlight>
                  <HighlightedLines text={service.detailBody} />
                </div>
              ))}
              {service_ids.length === 0 ? (
                <p className="text-center text-sm text-[#888]">
                  {t("select_services_hint")}
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className={HEADING_TEXT_CLASS}>المادة (2): مدة العقد</h2>
            <p>
              مدة العقد{" "}
              <Highlight>{formatDurationAr(duration)}</Highlight>
              <br />
              تبدأ من تاريخ توقيع الطرفين. يجدد العقد تلقائياً ما لم يُبلغ أحد
              الطرفين الآخر برغبته في الإنهاء قبل 15 يوماً من نهاية المدة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className={HEADING_TEXT_CLASS}>المادة (3): المقابل المالي</h2>
            <p>
              يدفع العميل للطرف الأول مبلغ{" "}
              <Highlight>
                {formatContractAmount(monthly_amount, currency)}
              </Highlight>{" "}
              شهرياً / حسب مدة الاتفاق السابقة. يُحوَّل المبلغ عبر بوابة الدفع الإلكترونية
              المعتمدة لشركة هوية للحلول الرقمية أو حساب المهندس محمود قنيطة.
            </p>
          </section>

          <StaticArticles />

          <section className="space-y-4 pt-2">
            <h2 className={HEADING_TEXT_CLASS}>المادة (12): نسخ العقد</h2>
            <p>
              حرّر هذا العقد من نسختين أصليتين بيد كل طرف نسخة للعمل بموجبها، وجرى
              توقيعه بتاريخ{" "}
              <Highlight>{formatContractDateAr(contract_date)}</Highlight> م.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <p className="text-center font-bold">توقيع الطرف الأول (الوكالة)</p>
              <p className="text-center font-bold">توقيع الطرف الثاني (العميل)</p>
            </div>
          </section>
              </main>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function StaticArticles() {
  const articles = [
    {
      n: 4,
      title: "الالتزامات",
      body: (
        <>
          <p className="font-bold">أ. التزامات الوكالة:</p>
          <ol className="list-decimal space-y-1 ps-6">
            <li>الالتزام بتقديم الخدمات وفق الخطة الزمنية المتفق عليها.</li>
            <li>
              تسليم تقارير الأداء شهرياً متضمنة التحليل التفصيلي للحملات
              والنتائج.
            </li>
            <li>الحفاظ على سرية بيانات العميل.</li>
          </ol>
          <p className="mt-2 font-bold">ب. التزامات العميل:</p>
          <ol className="list-decimal space-y-1 ps-6">
            <li>تزويد الوكالة بالمحتوى المطلوب في الوقت المحدد.</li>
            <li>
              عدم تعديل أو حذف أي منشورات أو حملات دون إشعار الوكالة.
            </li>
            <li>تسديد الدفعات في المواعيد المتفق عليها.</li>
          </ol>
        </>
      ),
    },
    {
      n: 5,
      title: "الحسابات والمنصات الرقمية",
      body: "جميع الحسابات والمنصات تُعد ضمن نطاق الشراكة. ولا يجوز لأي طرف تعديلها أو التصرف فيها دون موافقة خطية من الطرفين. تبقى ملكية المحتوى للعميل بعد انتهاء العقد وسداد جميع المستحقات.",
    },
    {
      n: 6,
      title: "التقارير والمتابعة",
      body: "يتم عقد اجتماع دوري كل 30 يوماً لمراجعة الأداء ومناقشة الخطط المستقبلية.",
    },
    {
      n: 7,
      title: "السرية والخصوصية",
      body: "يتعهد الطرفان بعدم إفشاء أي معلومات تخص الطرف الآخر خلال مدة العقد أو بعدها.",
    },
    {
      n: 8,
      title: "إنهاء العقد",
      body: "يجوز لأي طرف إنهاء العقد في حال الإخلال بأي من البنود بعد إشعار كتابي مدته 15 يوماً.",
    },
    {
      n: 9,
      title: "حل النزاعات",
      body: "في حال حدوث أي نزاع، يُحل ودياً خلال 15 يوماً، وإن تعذر، يُحال النزاع إلى الجهات القضائية المختصة في سلطنة عمان.",
    },
    {
      n: 10,
      title: "العلامة التجارية واللوجو",
      body: "يُعتبر شعار وهوية شركة هوية للحلول الرقمية علامة تجارية مسجلة، ويُمنع استخدامه أو تعديله دون إذن خطي من الإدارة.",
    },
    {
      n: 11,
      title: "التعاون وحل المشاكل التقنية",
      body: "يلتزم الطرف الثاني (العميل) بالتعاون الكامل مع الوكالة وتزويدها بجميع البيانات والموافقات والمحتويات اللازمة في الوقت المحدد لإنجاز الخدمات المتفق عليها. كما يلتزم العميل بمتابعة وحل أي مشاكل تقنية أو برمجية تتعلق بالموقع أو المتجر الإلكتروني الخاص به (بما في ذلك: الخوادم، الاستضافة، القوالب، الإضافات، أو أي أعطال في النظام) وذلك على نفقته الخاصة أو بالتنسيق مع الجهة المبرمجة. وفي حال حدوث أي تعطّل أو تأخير في تنفيذ المهام نتيجة لتلك المشاكل التقنية أو تأخر العميل في الرد أو التعاون، يُحتسب هذا التأخير ضمن مدة العقد المدفوعة، ولا يترتب على الوكالة أي تمديد أو تعويض زمني أو مالي عن الفترة المتأثرة بالتعطّل.",
    },
  ]

  return (
    <>
      {articles.map((article) => (
        <section key={article.n} className="space-y-2">
          <h2 className={HEADING_TEXT_CLASS}>
            المادة ({article.n}): {article.title}
          </h2>
          {typeof article.body === "string" ? <p>{article.body}</p> : article.body}
        </section>
      ))}
    </>
  )
}
