import prisma from '../../prisma/client'
import { BaileysChats } from '@prisma/client'
import { Chat } from '@whiskeysockets/baileys'
import AppError from 'src/errors/AppError'

const CreateOrUpdateBaileysChatService = async (whatsappId: number, chat: Partial<Chat>): Promise<BaileysChats> => {
  const { id, conversationTimestamp, unreadCount } = chat

  if (!id) {
    throw new AppError('Id do chat é requirido.', 400)
  }

  try {
    const existingChat = await prisma.baileysChats.findFirst({
      where: {
        whatsappId,
        jid: id
      }
    })
  
    if (existingChat) {
      const updateChat = await prisma.baileysChats.update({
        where: { id: existingChat.id },
        data: {
          conversationTimestamp: conversationTimestamp || existingChat.conversationTimestamp,
          unreadCount: unreadCount ? existingChat.unreadCount + unreadCount : existingChat.unreadCount
        }
      })
  
      return updateChat
    }

    // Se não encontrar, cria um novo chat
    const timestamp = Date.now()

    const newChat = prisma.baileysChats.create({
      data: {
        whatsappId,
        jid: id,
        conversationTimestamp: conversationTimestamp || timestamp,
        unreadCount: unreadCount || 1
      }
    })
  
    return newChat
  } catch (error: any) {
    console.error('Erro ao criar/atualizar chat baileys', error)
    throw new AppError(`Erro Interno no servidor ao processar chat bailey: ${error.message}`, 500)
  }
}

export default CreateOrUpdateBaileysChatService