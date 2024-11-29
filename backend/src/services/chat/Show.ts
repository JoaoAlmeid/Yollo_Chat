import { Chat } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowChatService = async (id: string | number): Promise<Chat> => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: Number(id) },
    })

    if (!chat) {
      throw new AppError('Erro: Chat não encontrado', 404)
    }

    return chat
  } catch (error: any) {
    console.error(`Erro ao exibir chat: ${error.message}`)
    throw new AppError(`Erro ao exibir chat: ${error.message}`, 500)
  }
}

export default ShowChatService