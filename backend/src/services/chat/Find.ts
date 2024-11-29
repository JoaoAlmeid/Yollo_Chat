import { Chat } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { FindParams } from './types'

const FindChatService = async ({ ownerId, companyId }: FindParams): Promise<Chat[]> => {
  try {
    const chats = await prisma.chat.findMany({
      where: { companyId, ownerId },
      include: {
        company: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        users: { 
          select: {
            user: { 
              select: { 
                id: true, 
                name: true 
              }
            } 
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return chats
  } catch (error: any) {
    console.error(`Erro ao buscar chat: ${error}`)
    throw new AppError(`Erro interno ao buscar chat: ${error.message}`, 500)
  }
}

export default FindChatService