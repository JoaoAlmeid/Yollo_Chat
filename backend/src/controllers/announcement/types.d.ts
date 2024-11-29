export type IndexQuery = {
    searchParam: string
    pageNumber: string
    companyId: string | number
}

export interface StoreData {
  priority: number
  title: string
  text: string
  status: boolean
  companyId: number
}

export type FindParams = {
  companyId: string
}