import { Chat, Contact } from '@prisma/client'

export interface RequestBaileys {
  whatsappId: number
  contacts?: Contact[]
  chats?: Chat[]
}
