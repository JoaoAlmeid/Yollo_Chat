import { Chat, ChatMessage } from '@prisma/client'

export interface ChatWithUsers extends Chat {
  users: {
    userId: number;
    user: {
      id: number;
      name: string;
    };
  }[];
}

export interface UpdateData {
  id: number
  ownerId: number
  companyId: number
  title?: string
  users?: { id: number }[]
}

export interface ChatMessageData {
  senderId: number;
  chatId: number;
  message: string;
}

export interface DataCreate {
  ownerId: number;
  companyId: number;
  users: any[]
  title: string;
}

export interface RequestChat {
  chatId?: string;
  ownerId: number;
  pageNumber?: string;
}

export interface ResponseFind {
  records: ChatMessage[];
  count: number;
  hasMore: boolean;
}

export interface ResponseList {
  records: Chat[];
  count: number;
  hasMore: boolean;
}

export interface FindParams {
  companyId: number
  ownerId?: number
}