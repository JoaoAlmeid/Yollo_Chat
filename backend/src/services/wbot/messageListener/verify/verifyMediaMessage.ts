import * as Sentry from '@sentry/node'
import { Ticket, Contact, Message } from '@prisma/client'
import { proto } from '@whiskeysockets/baileys'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import CreateMessageService from '../../../message/Create'
import { logger } from '../../../../utils/Logger'
import { getIO } from '../../../../libs/socket'
import prisma from '../../../../prisma/client'
import downloadMedia from '../downloadMedia'
import getBodyMessage from '../get/getBodyMessage'
import verifyQuotedMessage from './verifyQuotedMessage'
import formatBody from '../../../../helpers/Mustache'
import { promisify } from 'util'
import AppError from '../../../../errors/AppError'

const writeFileAsync = promisify(writeFile)

const verifyMediaMessage = async (msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact): Promise<Message> => {
  const io = getIO()
  const quotedMsg = await verifyQuotedMessage(msg)
  const media = await downloadMedia(msg)
  if (!media) { throw new Error('ERR_WAPP_DOWNLOAD_MEDIA') }

  if (!media.filename) {
    const ext = media.mimetype?.split('/')[1]?.split('')[0]
    media.filename = `${new Date().getTime()}.${ext}`
  }

  try {
    await writeFileAsync(
      join(__dirname, '..', '..', '..', 'public', media.filename),
      media.data,
      'base64'
    )
  } catch (err) {
    if (err instanceof Error) {
      Sentry.captureException(err)
      logger.error(err.message)
    }
    throw new Error('ERR_FILE_WRITE')
  }

  const contactDtls = await prisma.contact.findUnique({
    where: { id: ticket.contactId }
  })

  if (!contact) { throw new AppError('Contanto não encontrado', 404) }

  const body = getBodyMessage(msg)

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? formatBody(body, contactDtls) : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype?.split('/')[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
  }

  try {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { lastMessage: body || media.filename },
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

    const newMessage = await CreateMessageService({
      messageData,
      companyId: ticket.companyId,
    })

    if (!newMessage) {
      throw new Error('Falha ao criar mensagem')
    }

    if (!msg.key.fromMe && updatedTicket.status === 'closed') {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'pending' },
      })

      io.to('closed').emit(`company-${updatedTicket.companyId}-ticket`, {
        action: 'delete',
        ticket: updatedTicket,
        ticketId: updatedTicket.id,
      })

      io.to(updatedTicket.status)
        .to(updatedTicket.id.toString())
        .emit(`company-${updatedTicket.companyId}-ticket`, {
          action: 'update',
          ticket: updatedTicket,
          ticketId: updatedTicket.id,
        })
    }

    return newMessage
  } catch (error: any) {
    if (error instanceof Error) {
      Sentry.captureException(error)
      logger.error(error.message)
    } else {
      Sentry.captureException(error)
      logger.error('Ocorreu um erro desconhecido.')
    }
    throw new Error('ERR_PRISMA_UPDATE_TICKET')
  }
}

export default verifyMediaMessage