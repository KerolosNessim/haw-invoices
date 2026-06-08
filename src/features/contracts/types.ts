/** Numeric service id from `/v1/admin/services` (e.g. "54"). */
export type ContractServiceId = string

export type ContractDuration =
  | "3_months"
  | "6_months"
  | "12_months"
  | "1_year"

export type ContractServiceOption = {
  id: ContractServiceId
  order: number
  listLabel: string
  detailTitle: string
  detailBody: string
}

export type ContractFormDraft = {
  client_title: string
  client_name: string
  business_name: string
  commercial_registration: string
  contract_date: string
  duration: ContractDuration
  monthly_amount: number
  currency: string
  /** Selected service ids from catalog, e.g. ["54", "39"] */
  service_ids: ContractServiceId[]
}

export type ContractRecord = ContractFormDraft & {
  id: string
  contract_number: string
  created_at: string
  updated_at?: string
}

export type CreateContractPayload = ContractFormDraft

export type UpdateContractPayload = ContractFormDraft
