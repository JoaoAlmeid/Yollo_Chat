import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { RequestChat, ResponseList } from './types'

const ListChatsService = async ({ ownerId, pageNumber = '1' }: RequestChat): Promise<ResponseList> => {
  try {
    const chatUsers = await prisma.chatUser.findMany({
      where: { userId: ownerId },
      select: { chatId: true },
    })

    const chatIds = chatUsers.map(chatUser => chatUser.chatId)

    const limit = 20
    const offset = limit * (+pageNumber - 1)

    const chats = await prisma.chat.findMany({
      where: { id: { in: chatIds } },
      include: {
        company: true,
        users: {
          include: {
            user: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    const count = await prisma.chat.count({
      where: { id: { in: chatIds } }
    })

    const hasMore = count > offset + chats.length

    return {
      records: chats,
      count,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar chats: ${error.message}`)
    throw new AppError(`Erro interno ao listar chats: ${error.message}`, 500)
  }
}

export default ListChatsService