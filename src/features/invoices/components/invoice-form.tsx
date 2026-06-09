import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCountries } from "@/features/countries/hooks/useCountries";
import {
  countryLabel,
  pickDefaultCountryId,
} from "@/features/countries/services/countries-api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { useInvoiceCatalog } from "../hooks/useInvoiceCatalog";
import { useCreateInvoice } from "../hooks/useInvoices";
import { buildLineItemsFromKeys } from "../services/invoice-catalog-api";
import {
  DEFAULT_INVOICE_CURRENCY,
  INVOICE_CURRENCIES,
  normalizeInvoiceCurrency,
} from "../utils/invoice-currency";
import { generateInvoiceNumber } from "../utils/generate-invoice-number";
import { computeInvoiceTotals } from "../utils/invoice-math";
import InvoiceCatalogPicker from "./invoice-catalog-picker";
import InvoicePreview from "./invoice-preview";

const schema = z
  .object({
    client_name: z.string().min(1, { message: "validation.required" }),
    client_phone: z.string().min(1, { message: "validation.required" }),
    company_name: z.string().min(1, { message: "validation.required" }),
    package_keys: z.array(z.string()),
    service_keys: z.array(z.string()),
    course_keys: z.array(z.string()),
    discount: z.number().min(0),
    tax: z.number().min(0),
    currency: z.string().min(3).max(3),
    country_id: z.number().int().min(1, { message: "validation.required" }),
    notes: z.string().optional(),
  })
  .refine(
    (v) => v.package_keys.length + v.service_keys.length + v.course_keys.length > 0,
    { message: "catalog_required", path: ["package_keys"] },
  );

type FormValues = z.infer<typeof schema>;

export default function InvoiceForm() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "invoices.form" });
  const { t: commonT } = useTranslation("translation");
  const navigate = useNavigate();
  const locale = i18n.language.startsWith("ar") ? "ar" : "en";
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const createMutation = useCreateInvoice();

  const invoiceNumber = useMemo(() => generateInvoiceNumber(), []);
  const [lineCosts, setLineCosts] = useState<Record<string, number>>({});

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_name: "",
      client_phone: "",
      company_name: "",
      package_keys: [],
      service_keys: [],
      course_keys: [],
      discount: 0,
      tax: 0,
      currency: DEFAULT_INVOICE_CURRENCY,
      country_id: 0,
      notes: "",
    },
  });

  const watched = watch();
  const selectedCountryId = watched.country_id > 0 ? watched.country_id : undefined;

  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isError: catalogError,
    refetch: refetchCatalog,
  } = useInvoiceCatalog(selectedCountryId);

  const syncLineCostsForKeys = useCallback(
    (keys: string[]) => {
      setLineCosts((prev) => {
        const next: Record<string, number> = {};
        for (const key of keys) {
          const opt = catalog.find((o) => o.key === key);
          next[key] = prev[key] ?? opt?.price ?? 0;
        }
        return next;
      });
    },
    [catalog],
  );

  const handleLineCostChange = useCallback((key: string, cost: number) => {
    setLineCosts((prev) => ({ ...prev, [key]: cost }));
  }, []);

  useEffect(() => {
    if (countries.length === 0 || watched.country_id > 0) return;
    const defaultId = pickDefaultCountryId(countries);
    if (defaultId) setValue("country_id", defaultId, { shouldValidate: true });
  }, [countries, setValue, watched.country_id]);

  const selectedCountry = useMemo(
    () => countries.find((row) => row.id === watched.country_id),
    [countries, watched.country_id],
  );

  const allCatalogKeys = useMemo(
    () => [...watched.package_keys, ...watched.service_keys, ...watched.course_keys],
    [watched.package_keys, watched.service_keys, watched.course_keys],
  );

  const invoiceCurrency = normalizeInvoiceCurrency(watched.currency);

  const lineItems = useMemo(
    () =>
      buildLineItemsFromKeys(
        allCatalogKeys,
        catalog,
        watched.company_name,
        locale,
        lineCosts,
        invoiceCurrency,
      ),
    [allCatalogKeys, catalog, watched.company_name, locale, lineCosts, invoiceCurrency],
  );

  const { subtotal, discount, tax, total } = computeInvoiceTotals(
    lineItems,
    watched.discount ?? 0,
    watched.tax ?? 0,
  );

  const invoiceDateLabel = format(new Date(), "yyyy-MM-dd");

  const onSubmit = (values: FormValues) => {
    const keys = [...values.package_keys, ...values.service_keys, ...values.course_keys];
    if (keys.length === 0) {
      toast.error(t("catalog_required"));
      return;
    }

    const currency = normalizeInvoiceCurrency(values.currency);
    const items = buildLineItemsFromKeys(
      keys,
      catalog,
      values.company_name,
      locale,
      lineCosts,
      currency,
    );

    if (items.length === 0) {
      toast.error(t("catalog_required"));
      return;
    }

    createMutation.mutate(
      {
        invoice_number: invoiceNumber,
        client_name: values.client_name.trim(),
        client_phone: values.client_phone.trim(),
        company_name: values.company_name.trim(),
        discount: values.discount ?? 0,
        tax: values.tax ?? 0,
        notes: values.notes?.trim() || undefined,
        country_id: values.country_id,
        line_items: items.map((row) => ({
          type: row.type,
          id: row.id,
          cost: row.cost,
          currency,
        })),
      },
      {
        onSuccess: () => navigate("/invoices"),
      },
    );
  };

  const catalogKeysError =
    errors.package_keys?.message === "catalog_required" ? t("catalog_required") : undefined;

  const dir = i18n.dir();

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        toast.error(t("validation_error"));
      })}
      className="space-y-10"
      dir={dir}
    >
      <div className="rounded-[32px] border border-border/40 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-6 text-sm text-muted-foreground">
          {t("invoice_number_hint")}{" "}
          <span className="font-mono font-bold text-foreground" dir="ltr">
            HWEY - {invoiceNumber}
          </span>
        </p>

        <Controller
          name="country_id"
          control={control}
          render={({ field }) => (
            <Field className="mb-6">
              <FieldLabel>{t("country")}</FieldLabel>
              <Select
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(value) => {
                  const nextId = Number(value) || 0;
                  field.onChange(nextId);
                  setValue("package_keys", []);
                  setValue("service_keys", []);
                  setValue("course_keys", []);
                  setLineCosts({});
                }}
                disabled={countriesLoading || countries.length === 0}
              >
                <SelectTrigger className="h-12! w-full rounded-2xl">
                  <SelectValue placeholder={t("select_country")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((row) => (
                    <SelectItem key={row.id} value={String(row.id)}>
                      {countryLabel(row, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                errors={[
                  {
                    message:
                      errors.country_id?.message &&
                      commonT(errors.country_id.message),
                  },
                ]}
              />
            </Field>
          )}
        />

        <section className="rounded-2xl border border-border/40 bg-muted/10 p-5 md:p-6">
          <h3
            className="mb-5 text-sm font-bold"
            style={{ color: "#99C23C" }}
          >
            {t("bill_to")}
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              name="client_name"
              control={control}
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>{t("client_name")}</FieldLabel>
                  <Input {...field} className="h-12 rounded-2xl" />
                  <FieldError errors={[{ message: errors.client_name?.message && commonT(errors.client_name.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="company_name"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("company_name")}</FieldLabel>
                  <Input {...field} className="h-12 rounded-2xl" />
                  <FieldError errors={[{ message: errors.company_name?.message && commonT(errors.company_name.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="client_phone"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("client_phone")}</FieldLabel>
                  <Input {...field} dir="ltr" className="h-12 rounded-2xl" />
                  <FieldError errors={[{ message: errors.client_phone?.message && commonT(errors.client_phone.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>{t("notes")}</FieldLabel>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder={t("notes_placeholder")}
                    className="min-h-24 rounded-2xl"
                  />
                </Field>
              )}
            />
          </div>
        </section>

        {!selectedCountryId ? (
          <p className="mt-6 text-sm text-muted-foreground">{t("select_country_first")}</p>
        ) : null}

        {catalogError ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-destructive">{t("catalog_load_error")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void refetchCatalog()}
            >
              {t("catalog_retry")}
            </Button>
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 ">
          <Controller
            name="package_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="package"
                label={t("packages")}
                placeholder={t("select_packages")}
                emptyMessage={t("packages_empty_for_country")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...keys,
                    ...watched.service_keys,
                    ...watched.course_keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
                currency={invoiceCurrency}
              />
            )}
          />
          <Controller
            name="service_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="service"
                label={t("services")}
                placeholder={t("select_services")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...watched.package_keys,
                    ...keys,
                    ...watched.course_keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
                currency={invoiceCurrency}
              />
            )}
          />
          <Controller
            name="course_keys"
            control={control}
            render={({ field }) => (
              <InvoiceCatalogPicker
                type="course"
                label={t("courses")}
                placeholder={t("select_courses")}
                options={catalog}
                value={field.value}
                onChange={(keys) => {
                  field.onChange(keys);
                  syncLineCostsForKeys([
                    ...watched.package_keys,
                    ...watched.service_keys,
                    ...keys,
                  ]);
                }}
                lineCosts={lineCosts}
                onLineCostChange={handleLineCostChange}
                isLoading={catalogLoading}
                currency={invoiceCurrency}
              />
            )}
          />
        </div>

        {catalogKeysError ? (
          <p className="mt-4 text-sm font-medium text-destructive">{catalogKeysError}</p>
        ) : null}

        <div className="mt-6 grid  grid-cols-1 gap-4 lg:grid-cols-3 ">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("currency")}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(normalizeInvoiceCurrency(value))
                  }
                >
                  <SelectTrigger className="h-11! w-full rounded-xl">
                    <SelectValue placeholder={t("currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_CURRENCIES.map((row) => (
                      <SelectItem key={row.code} value={row.code}>
                        {locale === "ar" ? row.labelAr : row.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("discount")}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-11 rounded-xl"
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    field.onChange(Number.isFinite(n) && n >= 0 ? n : 0);
                  }}
                />
              </Field>
            )}
          />
          <Controller
            name="tax"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("tax")}</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-11 rounded-xl"
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    field.onChange(Number.isFinite(n) && n >= 0 ? n : 0);
                  }}
                />
              </Field>
            )}
          />
        </div>

        <div className={`mt-8 flex gap-3 ${dir === "rtl" ? "justify-start" : "justify-end"}`}>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/invoices")}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={
              createMutation.isPending ||
              allCatalogKeys.length === 0 ||
              !selectedCountryId
            }
            className="rounded-xl px-8 font-bold"
          >
            {createMutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="me-2 h-4 w-4" />
            )}
            {t("save")}
          </Button>
        </div>
      </div>

      <section className="space-y-4" dir="rtl">
        <h2 className="text-right text-xl font-bold tracking-tight">{t("preview_title")}</h2>
        <InvoicePreview
          id="invoice-preview-draft"
          invoiceNumber={invoiceNumber}
          invoiceDateLabel={invoiceDateLabel}
          clientName={watched.client_name}
          clientPhone={watched.client_phone}
          companyName={watched.company_name}
          notes={watched.notes}
          countryNameAr={selectedCountry?.nameAr}
          countryNameEn={selectedCountry?.nameEn}
          lineItems={lineItems}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          currency={invoiceCurrency}
        />
      </section>
    </form>
  );
}
