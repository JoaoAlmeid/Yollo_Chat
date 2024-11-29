import { Invoices } from '@prisma/client'

export interface ParamsInvoices {
  companyId: number
}

export interface RequestInvoices {
  searchParam?: string
  pageNumber?: string
}

export interface ResponseInvoices {
  invoices: Invoices[]
  count: number
  hasMore: boolean
}

export interface InvoiceData {
  status: string
  id?: number | string
}
