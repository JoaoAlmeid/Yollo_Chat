import { ContactListItem } from "@prisma/client";

export interface CreateData {
  name: string;
  number: string;
  contactListId: number;
  companyId: number;
  email?: string;
}

export interface UpdateData {
  id: number | string
  name: string
  number: string
  email?: string
}

export interface SearchParams {
  companyId: number
  contactListId: number
}

export interface ListRequest {
  searchParam?: string;
  pageNumber?: string;
  companyId: number | string;
  contactListId: number | string;
}

export interface ListResponse {
  contacts: ContactListItem[];
  count: number;
  hasMore: boolean;
}