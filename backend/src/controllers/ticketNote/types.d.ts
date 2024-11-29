export type IndexQuery = {
    searchParam: string
    pageNumber: string
}

export interface StoreTicketNoteData {
  note: string
  userId: number
  contactId: number | 0
  ticketId: number | 0
  id?: number | string
}

export interface UpdateTicketNoteData {
  note: string
  id?: number
  userId?: number | 0
  contactId?: number | 0
  ticketId?: number | 0
}

export interface QueryFilteredNotes {
  contactId: number | string
  ticketId: number | string
}