import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { BaileysChats } from '@prisma/client'

const ShowBaileysChatService = async (whatsappId: number, jid: string): Promise<BaileysChats> => {
  try {
    const baileysChat = await prisma.baileysChats.findFirst({
      where: {
        whatsappId,
        jid,
      },
    })

    if (!baileysChat) {
      throw new AppError('Erro: Chat bailey não encontrado', 404)
    }

    return baileysChat
  } catch (error: any) {
    console.error(`Erro ao exibir chat bailey: ${error}`)
    throw new AppError(`Erro interno no servidor ao exibir chat bailey: ${error.message}`, 500)
  }
}

export default ShowBaileysChatService