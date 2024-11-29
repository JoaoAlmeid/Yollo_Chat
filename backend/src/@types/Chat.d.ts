import { Chat, ChatMessage } from '@prisma/client'

interface CreateUserInput {
  userId: number
  unreads?: number
}

export interface CreateChatInput {
  ownerId?: number
  companyId: number
  userId: number
  title: string
  users: CreateUserInput[]
  usersId?: number
  messagesId?: number
}

export type Params = {
  companyId: number
  ownerId?: number
}

export interface RequestChat {
  ownerId: number
  pageNumber?: string
}

export interface ResponseChat {
  records: Chat[]
  count: number
  hasMore: boolean
}

export interface RequestChatMessage {
  chatId: number
  ownerId: number
  pageNumber?: string
}

export interface ResponseChatMessage {
  records: ChatMessage[]
  count: number
  hasMore: boolean
}

export interface ChatMessageData {
  senderId: number
  chatId: number
  message: string
  mediaName?: string
}
