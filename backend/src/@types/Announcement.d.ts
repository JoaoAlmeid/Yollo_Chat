import { Announcement } from '@prisma/client'

export interface AnnouncementData {
  priority: string
  title: string
  text: string
  status: string
  companyId: number
}

export interface UpData {
  id: number | string
  priority: number
  title: string
  text: string
  status: boolean
  companyId: number
}

export interface LRequest {
  searchParam?: string
  pageNumber?: string
}

export interface LResponse {
  records: Announcement[]
  count: number
  hasMore: boolean
}

export interface AnnouncementMediaData {
  id: string | number
  mediaPath: string
  mediaName: string
}
