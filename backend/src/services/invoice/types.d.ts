import { Invoice } from "@prisma/client";

export interface RequestFAll {
  companyId: number;
}

export interface RequestL {
  searchParam?: string;
  pageNumber?: string;
}

export interface ResponseL {
  invoices: Invoice[];
  count: number;
  hasMore: boolean;
}

export interface Data {
  status: string;
  id?: number | string;
}