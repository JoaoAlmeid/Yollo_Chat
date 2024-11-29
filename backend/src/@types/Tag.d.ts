import { Tag } from '@prisma/client'

export interface TagData {
  id?: number
  name?: string
  color?: string
  kanban?: number
}

export interface RequestUpTag {
  tagData: TagData
  id: string | number
}

export interface RequestTag {
  name: string
  color: string
  kanban: number
  companyId: number
}

export interface RequestListTag {
  companyId: number
  searchParam?: string
  pageNumber?: number
  pageSize?: number
}

export interface ResponseListTag {
  tags: Tag[]
  count: number
  hasMore: boolean
}

export interface RequestShowTag {
  tags: Tag[]
  ticketId: number
}
