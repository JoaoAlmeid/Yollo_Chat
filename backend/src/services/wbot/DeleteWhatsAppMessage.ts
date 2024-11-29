import { proto, WASocket } from '@whiskeysockets/baileys'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import GetTicketWbot from '../../helpers/GetTicketWbot'
import GetWbotMessage from '../../helpers/GetWbotMessage'
import { Message } from '@prisma/client'

const DeleteWhatsAppMessage = async (messageId: string): Promise<Message> => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { ticket: { include: { contact: true } } },
    })

    if (!message) {
      throw new AppError('Nenhuma mensagem encontrada com esse Id')
    }

    const { ticket } = message
    const messageToDelete = await GetWbotMessage(ticket, messageId)

    try {
      const wbot = await GetTicketWbot(ticket)
      const messageDelete = messageToDelete as proto.WebMessageInfo

      await (wbot as WASocket).sendMessage(messageDelete.key.remoteJid, {
        delete: {
          id: messageDelete.key.id,
          remoteJid: messageDelete.key.remoteJid,
          participant: messageDelete.participant,
          fromMe: messageDelete.key.fromMe,
        },
      })
    } catch (err) {
      console.log(err)
      throw new AppError('ERR_DELETE_WAPP_MSG')
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    })

    return message
  } catch (err) {
    console.error(err)
    throw new AppError('Erro ao deletar mensagem do whatsApp.')
  }
}

export default DeleteWhatsAppMessage