import { proto, WASocket } from '@whiskeysockets/baileys'
import { cacheLayer } from '../libs/cache'
import { getIO } from '../libs/socket'
import prisma from '../prisma/client'
import { logger } from '../utils/Logger'
import GetTicketWbot from './GetTicketWbot'
import { Ticket } from '@prisma/client'

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  // Atualiza as mensagens não lidas no banco
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { unreadMessages: 0 },
  })

  // Busca o ticket atualizado com as informações do contato
  const myTicket = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: { contact: true },
  })

  if (!myTicket) {
    throw new Error(`Ticket: ${ticket.id}, não encontrado!`)
  }
  // Atualiza o cache de mensagens não lidas
  await cacheLayer.set(`contacts:${ticket.contactId}:unreads`, '0')

  try {
    // Obtém o cliente do WhatsApp para o ticket
    const wbot = await GetTicketWbot(ticket)

    // Busca as mensagens não lidas e não enviadas por "fromMe"
    const getJsonMessage = await prisma.message.findMany({
      where: {
        ticketId: ticket.id,
        fromMe: false,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Marca a última mensagem não lida como lida
    if (getJsonMessage.length > 0) {
      const lastMessages: proto.IWebMessageInfo = JSON.parse(
        JSON.stringify(getJsonMessage[0].dataJson)
      )

      if (lastMessages.key && lastMessages.key.fromMe === false) {
        await (wbot as WASocket).chatModify(
          { markRead: true, lastMessages: [lastMessages] },
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`
        )
      }
    }

    // Marca todas as mensagens como lidas no banco
    await prisma.message.updateMany({
      where: {
        ticketId: ticket.id,
        read: false,
      },
      data: { read: true },
    })
  } catch (err) {
    console.log(err)
    logger.warn(
      `Não foi possivel marcas as mensagens como lidas. Talvez o whatsapp esteja desconectado! Erro: ${err}`
    )
  }

  const io = getIO()
  io.to(ticket.status)
    .to('notification')
    .emit(`compania-${ticket.companyId}-ticket`, {
      action: 'updateUnread',
      ticketId: ticket.id,
    })
}

export default SetTicketMessagesAsRead