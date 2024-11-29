export type IndexQuery = {
    searchParam: string
    pageNumber: string
    companyId: string | number
    contactListId: string | number
}

export type StoreData = {
  name: string
  number: string
  contactListId: number
  companyId?: string
  email?: string
}

export type FindParams = {
  companyId: number
  contactListId: number
}