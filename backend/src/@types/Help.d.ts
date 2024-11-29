import { Help } from '@prisma/client'

export interface DataHelp {
  id?: number | string
  title: string
  description: string
  video?: string
  link?: string
}

export interface RequestHelp {
  searchParam?: string
  pageNumber?: string
}

export interface ResponseHelp {
  records: Help[]
  count: number
  hasMore: boolean
}
