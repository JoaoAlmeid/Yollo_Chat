import { ContactCustomField } from "@prisma/client";

export interface ExtraInfo extends ContactCustomField {
  id?: number
  name: string;
  value: string;
}

export interface Data {
  name: string;
  number: string;
  isGroup?: boolean
  email?: string;
  profilePicUrl?: string;
  companyId?: number;
  extraInfo?: ExtraInfo[];
  whatsappId?: number
}

export interface ListRequest {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
}

export interface ListResponse {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

export interface SearchContactParams {
  companyId: string | number;
  name?: string;
}


export interface UpdateRequest {
  contactData: Data;
  contactId: string;
  companyId: number;
}