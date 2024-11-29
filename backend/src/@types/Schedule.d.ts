import { Schedule } from '@prisma/client'

export interface RequestSchedule {
  body: string
  sendAt: string
  contactId: number | string
  companyId: number | string
  userId?: number | string
}

export interface RequestListSchedule {
  searchParam?: string
  contactId?: number | string | null
  userId?: number | string | null
  companyId: number
  pageNumber?: string | number
}

export interface ResponseListSchedule {
  schedules: Schedule[]
  count: number
  hasMore: boolean
}

interface ScheduleData {
  id?: number
  body?: string
  sendAt?: string
  sentAt?: string
  contactId?: number
  companyId?: number
  ticketId?: number
  userId?: number
}

export interface RequestUpSchedule {
  scheduleData: ScheduleData
  id: string | number
  companyId: number
}
