import moment from 'moment'
import * as Sentry from '@sentry/node'
import { isNil } from 'lodash'
import { getIO } from '../../libs/socket'
import prisma from '../../prisma/client'

import CheckContactOpenTickets from '../../helpers/CheckContactOpenTickets'
import SetTicketMessagesAsRead from '../../helpers/SetTicketMessagesAsRead'
import GetTicketWbot from '../../helpers/GetTicketWbot'
import verifyMessage from '../wbot/messageListener/verify/verifyMessage'
import ListSettingsOneService from '..//setting/ListSettingsOne'
import ShowWhatsAppService from '..//whatsapp/ShowWhatsApp'
import SendWhatsAppMessage from '..//wbot/SendWhatsAppMessage'
import ShowUserService from '..//user/ShowUser'

import FindOrCreateATicketTrakingService from './FindOrCreateATicketTraking'
import ShowTicketService from './ShowTicket'
import { RequestUpTicket, ResponseUpTicket } from '../../@types/Tickets'

const UpdateTicket = async ({ ticketData, ticketId, companyId }: RequestUpTicket): Promise<ResponseUpTicket> => {
  try {
    const { status } = ticketData
    let { queueId, userId, chatbot, queueOptionId } = ticketData
    chatbot = chatbot ?? false
    queueOptionId = queueOptionId ?? null

    const io = getIO()

    const key = 'userRating'
    const setting = await prisma.setting.findFirst({
      where: { companyId: companyId, key: key },
    })

    const ticket = await ShowTicketService(ticketId, companyId)
    const ticketTracking = await FindOrCreateATicketTrakingService({
      ticketId: ticketId,
      companyId: companyId,
      whatsappId: ticket.whatsappId,
    })

    await SetTicketMessagesAsRead(ticket)

    const oldStatus = ticket.status
    const oldUserId = ticket.userId
    const oldQueueId = ticket.queueId

    // Busque o contato para usar no verifyMessage
    const contact = await prisma.contact.findUnique({
      where: { id: ticket.contactId },
    })

    if (!contact) {
      throw new Error(`Contato com ID ${ticket.contactId} não encontrado.`)
    }

    if (oldStatus === 'closed') {
      await CheckContactOpenTickets(ticket.contactId)
      chatbot = null
      queueOptionId = null
    }

    if (status !== undefined && status === 'closed') {
      // Ajustado para fornecer todos os argumentos esperados
      const whatsappServiceResult = await ShowWhatsAppService(
        ticket.whatsappId,
        companyId
      )
      const ratingMessage = whatsappServiceResult?.ratingMessage || ''
      const completionMessage = whatsappServiceResult?.complationMessage || ''

      if (setting?.value === 'enabled') {
        if (!ticketTracking.ratingAt) {
          const ratingTxt = ratingMessage || ''
          let bodyRatingMessage = `\u200e${ratingTxt}\n\n`
          bodyRatingMessage +=
            'Digite de 1 à 3 para qualificar nosso atendimento:\n*1* - _Insatisfeito_\n*2* - _Satisfeito_\n*3* - _Muito Satisfeito_\n\n'
          await SendWhatsAppMessage({
            body: bodyRatingMessage,
            ticket: ticket,
          })

          await prisma.ticketTracking.update({
            where: {
              id: ticketTracking.id,
            },
            data: {
              ratingAt: moment().toDate(),
            },
          })

          io.to('open')
            .to(ticketId.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: 'delete',
              ticketId: ticket.id,
            })

          return { ticket, oldStatus, oldUserId }
        }
        ticketTracking.ratingAt = moment().toDate()
        ticketTracking.rated = false
      }

      if (!isNil(completionMessage) && completionMessage !== '') {
        const body = `\u200e${completionMessage}`
        await SendWhatsAppMessage({ body, ticket: ticket })
      }

      ticketTracking.finishedAt = moment().toDate()
      ticketTracking.whatsappId = ticket.whatsappId
      ticketTracking.userId = ticket.userId
    }

    if (queueId !== undefined && queueId !== null) {
      ticketTracking.queuedAt = moment().toDate()
    }

    const settingsTransfTicket = await ListSettingsOneService(companyId)

    if (settingsTransfTicket?.value === 'enabled') {
      if (
        oldQueueId !== queueId &&
        oldUserId === userId &&
        !isNil(oldQueueId) &&
        !isNil(queueId)
      ) {
        const queue = await prisma.queue.findUnique({
          where: {
            id: queueId,
          },
        })
        const wbot = await GetTicketWbot(ticket)
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}*\naguarde, já vamos te atender!`

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          {
            text: msgtxt,
          }
        )
        if (queueChangedMessage) {
          await verifyMessage(queueChangedMessage, ticket, contact)
        }
      } else if (
        oldUserId !== userId &&
        oldQueueId === queueId &&
        !isNil(oldUserId) &&
        !isNil(userId)
      ) {
        const wbot = await GetTicketWbot(ticket)
        const nome = await ShowUserService(userId)
        const msgtxt = `*Mensagem automática*:\nFoi transferido para o atendente *${nome.name}*\naguarde, já vamos te atender!`

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          {
            text: msgtxt,
          }
        )
        if (queueChangedMessage) {
          await verifyMessage(queueChangedMessage, ticket, contact)
        }
      } else if (
        oldUserId !== userId &&
        !isNil(oldUserId) &&
        !isNil(userId) &&
        oldQueueId !== queueId &&
        !isNil(oldQueueId) &&
        !isNil(queueId)
      ) {
        const wbot = await GetTicketWbot(ticket)
        const queue = await prisma.queue.findUnique({
          where: {
            id: queueId,
          },
        })
        const nome = await ShowUserService(userId)
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}* e contará com a presença de *${nome.name}*\naguarde, já vamos te atender!`

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          {
            text: msgtxt,
          }
        )
        if (queueChangedMessage) {
          await verifyMessage(queueChangedMessage, ticket, contact)
        }
      } else if (
        oldUserId !== undefined &&
        isNil(userId) &&
        oldQueueId !== queueId &&
        !isNil(queueId)
      ) {
        const queue = await prisma.queue.findUnique({
          where: {
            id: queueId,
          },
        })
        const wbot = await GetTicketWbot(ticket)
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}*\naguarde, já vamos te atender!`

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
          {
            text: msgtxt,
          }
        )
        if (queueChangedMessage) {
          await verifyMessage(queueChangedMessage, ticket, contact)
        }
      }
    }

    await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: status !== undefined ? status : undefined,
        userId: userId !== undefined && userId !== null ? userId : undefined,
        queueId:
          queueId !== undefined && queueId !== null ? queueId : undefined,
        chatbot:
          chatbot !== undefined && chatbot !== null ? chatbot : undefined,
        queueOptionId:
          queueOptionId !== undefined && queueOptionId !== null
            ? queueOptionId
            : undefined,
      },
    })

    io.to('open')
      .to(ticketId.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: 'update',
        ticket,
      })

    return { ticket, oldStatus, oldUserId }
  } catch (error: any) {
    Sentry.captureException(error)
    throw error
  }
}

export default UpdateTicket
