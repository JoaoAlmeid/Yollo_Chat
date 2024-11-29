import prisma from '../../prisma/client'
import { BaileysChats } from '@prisma/client'
import AppError from 'src/errors/AppError';

interface Data {
  id?: string
  conversationTimestamp?: number;
  unreadCount?: number;
}

const UpdateBaileysChatService = async (whatsappId: number, jid: string, data: Data): Promise<BaileysChats> => {
  try {
    const baileysChat = await prisma.baileysChats.findFirst({
      where: {
        whatsappId,
        jid
      }
    })
    
    if (!baileysChat) {
      throw new AppError('Erro: Chat bailey não encontrado', 404)
    }
  
    const updateChat = await prisma.baileysChats.update({
      where: { id: baileysChat.id },
      data: {
        conversationTimestamp: data.conversationTimestamp,
        unreadCount: data.unreadCount
      }
    })
  
    return updateChat
  } catch (error: any) {
    console.error(`Erro ao atualizar chat bailey: ${error}`)
    throw new AppError(`Erro interno no servidor ao atualizar chat bailey: ${error.message}`)
  }
}

export default UpdateBaileysChatService