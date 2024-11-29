import { WAMessage } from '@whiskeysockets/baileys'
import * as Sentry from '@sentry/node'
import AppError from '../../errors/AppError'
import GetTicketWbot from '../../helpers/GetTicketWbot'
import formatBody from '../../helpers/Mustache'
import prisma from '../../prisma/client'
import { Message, Ticket } from '@prisma/client'

interface Request {
  body: string
  ticket: Ticket
  quotedMsg?: Message
}

const SendWhatsAppMessage = async ({ body, ticket, quotedMsg }: Request): Promise<WAMessage> => {
  let options: any = {}

  // Buscar o ticket e o contato associado
  const myTicket = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: { contact: true },
  })

  if (!myTicket || !myTicket.contact) {
    throw new AppError('ERR_TICKET_NOT_FOUND')
  }

  const wbot = await GetTicketWbot(myTicket)
  const number = `${myTicket.contactId}@${
    myTicket.isGroup ? 'g.us' : 's.whatsapp.net'
  }`

  if (quotedMsg) {
    const myQuotedMsg = await prisma.message.findUnique({
      where: { id: quotedMsg.id },
    })

    if (quotedMsg) {
      const msgFound = JSON.parse(myQuotedMsg.dataJson)
      options = {
        quoted: {
          key: msgFound.key,
          message: {
            extendedTextMessage: msgFound.message.extendedTextMessage,
          },
        },
      }
    }
  }

  try {
    const formattedBody = formatBody(body, myTicket.contact)
    const sentMessageText = await wbot.sendMessage(
      number,
      {
        text: formattedBody,
      },
      {
        ...options,
      }
    )

    if (typeof sentMessageText !== 'string') {
      throw new AppError('ERR_SENDING_WAPP_MSG')
    }

    const sentMessage: WAMessage = JSON.parse(sentMessageText)

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { lastMessage: formattedBody },
    })

    return sentMessage
  } catch (err) {
    Sentry.captureException(err)
    console.log(err)
    throw new AppError('ERR_SENDING_WAPP_MSG')
  } finally {
    await prisma.$disconnect()
  }
}

export default SendWhatsAppMessage
