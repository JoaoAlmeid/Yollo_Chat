export type IndexQuery = {
    searchParam: string
    pageNumber: string
    companyId: string | number
}

export interface StoreData {
  name: string
  status: string
  confirmation: boolean
  scheduledAt: string
  companyId: number
  contactListId: number
  tagListId: number | string
  fileListId: number
}

export type FindParams = {
  companyId: string
} 