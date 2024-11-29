export type IndexQuery = {
    pageNumber: string
}

export type MessageData = {
  body: string
  fromMe: boolean
  read: boolean
  quotedMsg?: Message
  number?: string
  closeTicket?: true
}