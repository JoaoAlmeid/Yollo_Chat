import { Message, Ticket } from "@prisma/client"

export interface RequestL {
  ticketId: string
  companyId: number
  pageNumber?: string
  queues?: number[]
}

export interface ResponseL {
  messages: Message[]
  ticket: Ticket
  count: number
  hasMore: boolean
}

export interface GetRequest {
  id: string
}

export interface Data {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  queueId?: number;
}

export interface RequestC {
  messageData: MessageData;
  companyId: number;
}
