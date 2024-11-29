import { Ticket, TicketNote } from '@prisma/client'

export interface RequestTicket {
  contactId: number
  status: string
  userId: number
  companyId: number
  queueId?: number
  whatsappId?: string
}

export interface ParamsTicket {
  ticketId: string | number
  companyId: string | number
  whatsappId?: string | number
  userId?: string | number
}

export interface RequestListTicket {
  searchParam?: string
  pageNumber?: string
  status?: string
  date?: string
  updatedAt?: string
  showAll?: string
  userId: string
  withUnreadMessages?: string
  queueIds: (number | null)[]
  tags: number[]
  users: number[]
  companyId: string
}

export interface ResponseListTicket {
  tickets: any[]
  count: number
  hasMore: boolean
}

// Define a estrutura do TicketData
export interface TicketData {
  status?: string
  userId?: number | null
  queueId?: number | null
  chatbot?: boolean
  queueOptionId?: number
  whatsappId?: string
  useIntegration?: boolean
  integrationId?: number | null
  promptId?: number | null
}

// Define a estrutura do Request
export interface RequestUpTicket {
  ticketData: TicketData
  ticketId: number | number
  companyId: number
}

// Define a estrutura do Response
export interface ResponseUpTicket {
  ticket: Ticket
  oldStatus: string
  oldUserId: number | undefined
}

export interface TicketNoteData {
  id?: number
  note: string
  userId?: number | string
  contactId?: number | string
  ticketId?: number | string
}

export interface ParamsNote {
  contactId: number | string
  ticketId: number | string
}

export interface RequestTicketNote {
  searchParam?: string
  pageNumber?: number
}

export interface ResponseTicketNote {
  ticketNotes: TicketNote[]
  count: number
  hasMore: boolean
}
