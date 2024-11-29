import prisma from '../../../prisma/client'
import { orderBy } from 'lodash'
import AppError from '../../../errors/AppError'
import { RequestChatMessage, ResponseChatMessage } from '../../../@types/Chat'

async function validateUserInChat(chatId: number, ownerId: number) {
  const userInChat = await prisma.chatUser.count({
    where: { chatId, userId: ownerId },
  })

  if (userInChat === 0) {
    throw new AppError('UNAUTHORIZED', 400)
  }
}

export default async function FindMessages({
  chatId,
  ownerId,
  pageNumber = '1',
}: RequestChatMessage): Promise<ResponseChatMessage> {
  if (!chatId || !ownerId) {
    throw new AppError('Missing required fields', 400)
  }

  await validateUserInChat(chatId, ownerId)

  const limit = 20
  const offset = limit * (parseInt(pageNumber) - 1)

  const messages = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  const count = await prisma.chatMessage.count({
    where: { chatId },
  })

  const hasMore = count > offset + messages.length

  const sorted = orderBy(messages, ['id'], ['asc'])

  return {
    records: sorted,
    count,
    hasMore,
  }
}
