import { Chat, Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowFromUuidService = async (uuid: string): Promise<Chat> => {
  try {
    const chatUuid = await prisma.chat.findFirst({
      where: { uuid },
    })

    if (!chatUuid) {
      throw new AppError('Erro: Bate-papo não encontrado', 404)
    }

    return chatUuid
  } catch (error: any) {
    console.error(`Erro ao exibir chat pelo UUID: ${error.message}`)
    throw new AppError(`Erro ao exibir chat pelo UUID: ${error.message}`, 500)
  }
}

export default ShowFromUuidService