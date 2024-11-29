import { ContactCustomField } from '@prisma/client'

export type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export type IndexGetContactQuery = {
  name: string;
  number: string;
};

export interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

export interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
}