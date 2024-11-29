import { Message, Contact, Queue, QuickMessage } from '@prisma/client'

export interface MessageData {
  id: string
  ticketId: number
  body: string
  contactId?: number
  fromMe?: boolean
  read?: boolean
  mediaType?: string
  mediaUrl?: string
  ack?: number
  queueId?: number
}

export interface RequestMessage {
  messageData: MessageData
  companyId: number
}

export interface ReqListMessage {
  ticketId: string
  companyId: number
  pageNumber?: string
  queues?: number[]
}

export interface ResListMessage {
  messages: (Message & {
    contact: Contact
    quotedMsg?: (Message & { contact: Contact }) | null
    queue?: Queue
  })[]
  ticket: Ticket
  count: number
  hasMore: boolean
}

export interface DataQuickMessage {
  id?: number
  shortcode: string
  message: string
  companyId: number
  userId: number
}

export interface ParamsQuickMessage {
  companyId: string | number
  userId: string | number
}

export interface ReqQuickMessage {
  searchParam?: string
  pageNumber?: string
  companyId: number | string
  userId: number | string
}

export interface ResQuickMessage {
  records: QuickMessage[]
  count: number
  hasMore: boolean
}
