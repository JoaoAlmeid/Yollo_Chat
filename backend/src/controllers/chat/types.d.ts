export type IndexQuery = {
    pageNumber: string
    companyId: number
    ownerId?: number
}

export interface StoreData {
  users: any[]
  title: string
}

export type FindParams = {
  companyId: number
  ownerId?: number
}