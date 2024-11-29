import { proto } from '@whiskeysockets/baileys'
import { Ticket, Contact, Message } from '@prisma/client'
import { getIO } from '../../../../libs/socket'
import verifyQuotedMessage from './verifyQuotedMessage'
import getBodyMessage from '../get/getBodyMessage'
import getTypeMessage from '../get/getTypeMessage'
import prisma from '../../../../prisma/client'
import CreateMessageService from '../../../message/Create'

const verifyMessage = async (msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact) => {
  if (!msg) return undefined

  const io = getIO()
  const quotedMsg = await verifyQuotedMessage(msg)
  const body = getBodyMessage(msg)
  const isEdited = getTypeMessage(msg) == 'editedMessage'

  const messageData = {
    id: isEdited ? msg?.message?.editedMessage?.message?.protocolMessage?.key?.id : msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
	  isEdited: isEdited,
  }

  try {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { lastMessage: body },
    })

    await CreateMessageService({ messageData, companyId: ticket.companyId })

    if (!msg.key.fromMe && ticket.status === 'closed') {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'pending' },
      })

      const updatedTicket = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          queue: true,
          user: true,
          contact: true,
        },
      })

      if (!updatedTicket) {
        throw new Error(`Ticket com Id: ${ticket.id}, não encontrado após atualização.`)
      }

      io.to('closed').emit(`company-${ticket.companyId}-ticket`, {
        action: 'delete',
        ticket: updatedTicket,
        ticketId: updatedTicket.id,
      })

      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: 'update',
          ticket: updatedTicket,
          ticketId: updatedTicket.id,
        })
    }
  } catch (error: any) {
    console.error('Erro ao verificar mensagem:', error)
    throw new Error('Erro ao verificar mensagem.')
  }
}

export default verifyMessage
