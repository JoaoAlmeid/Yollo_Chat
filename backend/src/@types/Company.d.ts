export interface CompanyData {
  name: string
  id?: number | string
  phone?: string
  email?: string
  password?: string
  status?: boolean
  planId?: number
  campaignsEnabled?: boolean
  dueDate?: string
  recurrence?: string
}

export interface RequestCompany {
  searchParam?: string
  pageNumber: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ResponseCompany {
  companies: Company[]
  count: number
  hasMore: boolean
}

export type ScheduleData = {
  id: number | string
  schedules: any[]
}

export type ScheduleResult = {
  id: number
  currentSchedule: {
    id: number
    weekdayEn: string
    startTime: string
    endTime: string
  } | null
  startTime: string
  endTime: string
  inActivity: boolean
}

export interface ScheduleInput {
  body: string
  queueId: number
  scheduleInfo: any
  sendAt: Date
  status: string
  contactId: number
  ticketId: number
  userId: number
  companyId: number
}
