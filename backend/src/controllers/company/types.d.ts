export type IndexQuery = {
    searchParam: string
    pageNumber: string
}

export interface TokenPayload {
  id: string
  username: string
  profile: string
  companyId: number
  iat: number
  exp: number
}

export type CompanyData = {
  name: string
  id?: number
  phone?: string
  email?: string
  status?: boolean
  planId?: number
  campaignsEnabled?: boolean
  dueDate?: string
  recurrence?: string
}

export type SchedulesData = {
  schedules: []
}