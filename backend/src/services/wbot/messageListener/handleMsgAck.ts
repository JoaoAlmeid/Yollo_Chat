import { getIO } from '../../../libs/socket'
import { WAMessage } from '@whiskeysockets/baileys'
import prisma from '../../../prisma/client'
import { logger } from '../../../utils/Logger'
import * as Sentry from '@sentry/node'

const handleMsgAck = async (msg: WAMessage, chat: number | null | undefined) => {
  await new Promise(r => setTimeout(r, 500))
  const io = getIO()

  try {
    let messageId = msg.key.id
    if (!messageId) {
      logger.error(`Id da mensagem é nulo ou não foi definido: ${messageId}`)
      return
    }

    const messageToUpdate = await prisma.message.findUnique({
      where: { id: messageId },
      include: { contact: true },
    })

    if (!messageToUpdate) {
      logger.error(`Mensagem com ID: ${messageId}, não encontrada`)
      return
    }

    const updateData: any = {}
    if (chat !== null && chat !== undefined) {
      updateData.ack = chat
    }

    await prisma.message.update({
      where: { id: messageId },
      data: updateData,
    })

    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      {
        action: 'update',
        message: messageToUpdate,
      }
    )
  } catch (err) {
    Sentry.captureException(err)
    logger.error(`Erro no manuseio da mensagem ack. Err: ${err}`)
  } finally {
    await prisma.$disconnect()
  }
}

export default handleMsgAck