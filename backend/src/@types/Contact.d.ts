import { Contact, ContactList, ContactListItem } from '@prisma/client'

interface ContactData {
  email?: string
  number?: string
  name?: string
  profilePicUrl?: string
  extraInfo?: ExtraInfo[]
}

export interface RequestContact {
  name: string
  number: string
  email?: string
  profilePicUrl?: string
  companyId: number
  extraInfo?: { name: string; value: string }[]
}

export interface ListRequest {
  searchParam?: string
  pageNumber?: string
  companyId: number
}

export interface ListResponse {
  contacts: Contact[]
  count: number
  hasMore: boolean
}

export interface SearchContactParams {
  companyId?: string | number
  name?: string
}

export interface UpRequestContact {
  contactData: ContactData
  contactId: string
  companyId: number
}

export interface DataListContact {
  id?: number
  name: string
  companyId?: number | string
}

export interface ParamsListContact {
  companyId: string
  contactListId?: number | string
}

export interface ResponseListContact {
  records: ContactList[]
  count: number
  hasMore: boolean
}

export interface DataContactListItem {
  id?: number | string
  name: string
  number: string
  contactListId?: number
  companyId: number
  email?: string
}

export interface ReqContactListItem {
  searchParam?: string
  pageNumber?: string
  companyId: number | string
  contactListId: number | string
}

export interface ResContactListItem {
  contacts: ContactListItem[]
  count: number
  hasMore: boolean
}
