import { Chat } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const FindAllChatService = async (): Promise<Chat[]> => {
  try {
    const todosChats: Chat[] = await prisma.chat.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return todosChats
  } catch (error: any) {
    console.error(`Erro ao buscar todos as chats: ${error.message}`)
    throw new AppError(`Erro ao buscar todos as chats: ${error.message}`, 500)
  }
}

export default FindAllChatService