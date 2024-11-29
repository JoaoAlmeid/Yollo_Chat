export type IndexQuery = {
    searchParam: string
    pageNumber: string
    status: string
    date: string
    updatedAt?: string
    showAll: string
    withUnreadMessages: string
    queueIds: string
    tags: string
    users: string
}

export interface TicketData {
  contactId: number
  status: string
  queueId: number
  userId: number
  whatsappId: string
  useIntegration: boolean
  promptId: number
  integrationId: number
} 