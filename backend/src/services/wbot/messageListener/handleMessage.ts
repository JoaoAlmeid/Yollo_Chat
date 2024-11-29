import { proto, WASocket } from '@whiskeysockets/baileys'
import * as Sentry from '@sentry/node'
import { debounce, isNil } from 'lodash'
import { Contact, Message } from '@prisma/client'
import prisma from '../../../prisma/client'
import moment from 'moment'
import verifyRating from './verify/verifyRating'
import verifyMediaMessage from './verify/verifyMediaMessage'
import isValidMsg from './validate/isValidMsg'
import getBodyMessage from './get/getBodyMessage'
import getContactMessage from './get/getContactMessage'
import getTypeMessage from './get/getTypeMessage'
import verifyContact from './verify/verifyContact'
import verifyMessage from './verify/verifyMessage'
import verifyQueue from './verify/verifyQueue'
import handleChartbot from './handleChartbot'
import VerifyCurrentSchedule from '../../company/VerifyCurrentSchedule'
import FindOrCreateATicketTrakingService from '../../../services/tickets/FindOrCreateATicketTraking'
import FindOrCreateTicketService from '../../../services/tickets/FindOrCreateTicket'
import ShowWhatsAppService from '../../../services/whatsapp/ShowWhatsApp'
import { cacheLayer } from '../../../libs/cache'
import formatBody from '../../../helpers/Mustache'
import { logger } from '../../../utils/Logger'
import { Session } from '../../../@types/Session'
import { IMe } from '../../../@types/wbot'
import ShowQueueIntegrationService from '../../queueIntegration/ShowQueueIntegrationService'
import handleMessageIntegration from './handleMessageIntegration'
import handleOpenAi from './handleOpenAi'
import handleRating from './handleRating'
import provider from '../providers'

const handleMessage = async (msg: proto.IWebMessageInfo, wbot: Session, companyId: number): Promise<void> => {
  let mediaSent: Message | undefined

  if (!isValidMsg(msg)) return
  try {
    let msgContact: IMe
    let groupContact: Contact | undefined

    const isGroup = msg.key.remoteJid?.endsWith('@g.us')
    const msgIsGroupBlock = await prisma.setting.findFirst({
      where: {
        companyId,
        key: 'CheckMsgIsGroup',
      },
    })

    const bodyMessage = getBodyMessage(msg)
    const msgType = getTypeMessage(msg)

    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage ||
      msg.message.stickerMessage

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return

      if (
        !hasMedia &&
        msgType !== 'conversation' &&
        msgType !== 'extendedTextMessage' &&
        msgType !== 'vcard'
      )
        return
      msgContact = await getContactMessage(msg, wbot)
    } else {
      msgContact = await getContactMessage(msg, wbot)
    }

    if (msgIsGroupBlock?.value === 'enabled' && isGroup) return

    if (isGroup) {
      const remoteJid = msg.key.remoteJid

      if (remoteJid) {
        const grupoMeta = await wbot.groupMetadata(remoteJid)

        if (grupoMeta && grupoMeta.id && grupoMeta.subject) {
          const msgGroupContact = {
            id: grupoMeta.id,
            name: grupoMeta.subject,
          }
          groupContact = await verifyContact(msgGroupContact, wbot, companyId)
        } else {
          console.error('Erro ao obter metadados do grupo:', grupoMeta)
        }
      }
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId)
    const contact = await verifyContact(msgContact, wbot, companyId)

    let unreadMessages = 0

    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, '0')
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`)
      unreadMessages = +unreads + 1
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      )
    }

    const lastMessage = await prisma.message.findFirst({
      where: {
        contactId: contact.id,
        companyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (
      unreadMessages === 0 &&
      whatsapp.complationMessage &&
      (formatBody(whatsapp.complationMessage, contact)).trim().toLowerCase()
    ) {
      return
    }

    const ticket = await FindOrCreateTicketService(
      contact.id,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact.id
    )
    await provider(ticket, msg, contact, wbot as WASocket)

    // voltar para o menu inicial
    if (bodyMessage === '#') {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          queueOptionId: null,
          chatbot: false,
          queueId: null,
        },
      })
      await verifyQueue(wbot, msg, ticket, contact)
      return
    }

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id,
    })

    try {
      if (
        !msg.key.fromMe &&
        ticketTraking !== null &&
        verifyRating(ticketTraking)
      ) {
        handleRating(Number(bodyMessage), ticket, ticketTraking)
        return
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
    }

    try {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { fromMe: msg.key.fromMe }
      })
    } catch (e) {
      Sentry.captureException(e)
      console.log(e)
    }

    if (hasMedia) {
      mediaSent = await verifyMediaMessage(msg, ticket, contact)
    } else {
      await verifyMessage(msg, ticket, contact)
    }

    const currentSchedule = await VerifyCurrentSchedule(companyId)
    const scheduleType = await prisma.setting.findFirst({
      where: {
        companyId,
        key: 'scheduleType',
      },
    })

    try {
      if (!msg.key.fromMe && scheduleType) {
        // Envio de mensagem quando a empresa estiver fora do expediente
        if (
          scheduleType.value === 'company' &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false)
        ) {
          if (!whatsapp) {
            console.error('WhatsApp não encontrado.')
            return
          }

          const body = `${whatsapp.outOfHoursMessage}`
          const debouncedSentMessage = debounce(
            async () => {
              if (!whatsapp) {
                console.error('WhatsApp não encontrado.')
                return
              }

              await wbot.sendMessage(
                `${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
                {
                  text: body,
                }
              )
            },
            3000,
            { leading: true }
          )
          debouncedSentMessage()
          return
        }

        if (scheduleType.value === 'queue' && ticket.queueId !== null) {
          // Envio de mensagem quando a fila estiver fora do expediente
          const queue = await prisma.queue.findFirst({ where: { id: ticket.queueId } })
          if (!queue) { console.error('Fila não encontrada') }

          const { schedules }: any = queue
          const now = moment()
          const weekday = now.format('dddd').toLowerCase()
          let schedule = null

          if (Array.isArray(schedules) && schedules.length > 0) {
            schedule = schedules.find(
              s =>
                s.weekdayEn === weekday &&
                s.startTime !== '' &&
                s.startTime !== null &&
                s.endTime !== '' &&
                s.endTime !== null
            )
          }

          if (
            scheduleType.value === 'queue' &&
            queue.outOfHoursMessage !== null &&
            queue.outOfHoursMessage !== '' &&
            !isNil(schedule)
          ) {
            const startTime = moment(schedule.startTime, 'HH:mm')
            const endTime = moment(schedule.endTime, 'HH:mm')

            if (now.isBefore(startTime) || now.isAfter(endTime)) {
              if (!queue) {
                console.error('Fila não encontrada.')
                return
              }

              const body = `${queue.outOfHoursMessage}`
              const debouncedSentMessage = debounce(
                async () => {
                  await wbot.sendMessage(
                    `${ticket.contactId}@${
                      ticket.isGroup ? 'g.us' : 's.whatsapp.net'
                    }`,
                    {
                      text: body,
                    }
                  )
                },
                3000,
                { leading: true }
              )
              debouncedSentMessage()
              return
            }
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e)
      console.error(e)
    }

    try {
      if (!msg.key.fromMe) {
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(parseFloat(bodyMessage), ticket, ticketTraking)
          return
        }
      }
    } catch (error: any) {
      Sentry.captureException(error)
      console.error(error)
    }

    // Openai na conexão
    if (!ticket.queueId && !isGroup && !msg.key.fromMe && !ticket.userId && !isNil(whatsapp.promptId)) {
      await verifyQueue(wbot, msg, ticket, contact, mediaSent)
    }

    // Integração na conexão
    if (!msg.key.fromMe && !ticket.isGroup && !ticket.queueId && !ticket.userId && ticket.chatbot && !isNil(whatsapp.integrationId) && !ticket.useIntegration) {
      const integrations = await ShowQueueIntegrationService(whatsapp.integrationId, companyId)
      await handleMessageIntegration(msg, wbot, integrations, ticket)
      return
    }

    // Openai na fila
    if (!isGroup && !msg.key.fromMe && !ticket.userId && !isNil(ticket.promptId) &&ticket.useIntegration && ticket.queueId) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
    }

    if (!msg.key.fromMe && !ticket.isGroup && !ticket.userId && ticket.integrationId && ticket.useIntegration && ticket.queueId) {
      console.log("entrou no type 1974")
      const integrations = await ShowQueueIntegrationService(ticket.integrationId, companyId);
      await handleMessageIntegration(msg, wbot, integrations, ticket)
    }

    if (!ticket.queueId && !ticket.isGroup && !msg.key.fromMe && !ticket.userId && whatsapp.queues && whatsapp.queues.length >= 1 && !ticket.useIntegration) {
      await verifyQueue(wbot, msg, ticket, contact);

      if (ticketTraking.chatbotAt === null) {
        await prisma.ticketTracking.update({
          where: { id: ticketTraking.id },
          data: {
            chatbotAt: moment().toDate(),
          }
        })
      }
    }

    const dontReadTheFirstQuestion = ticket.queueId === null
    
    try {
      // Fluxo fora do expediente
      if (!msg.key.fromMe && scheduleType && ticket.queueId !== null) {
        const queue = await prisma.queue.findFirst({ where: { id: ticket.queueId } })

        const { schedules }: any = queue
        const now = moment()
        const weekday = now.format('dddd').toLowerCase()
        let schedule = null

        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(
            s =>
              s.weekdayEn === weekday &&
              s.startTime !== '' &&
              s.startTime !== null &&
              s.endTime !== '' &&
              s.endTime !== null
          )
        }

        if (scheduleType.value === 'queue' && queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== '' && !isNil(schedule)) {
          const startTime = moment(schedule.startTime, 'HH:mm')
          const endTime = moment(schedule.endTime, 'HH:mm')

          if (now.isBefore(startTime) || now.isAfter(endTime)) {
            const body = queue.outOfHoursMessage
            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(`${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
                  { text: body }
                )
              },
              3000,
              { leading: true }
            )
            debouncedSentMessage()
            return
          }
        }
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
    }

    if (!whatsapp?.queues?.length && !ticket.userId && !isGroup && !msg.key.fromMe) {
      const lastMessage = await prisma.message.findFirst({
        where: {
          ticketId: ticket.id,
          fromMe: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (lastMessage && whatsapp?.greetingMessage && lastMessage.body.includes(whatsapp.greetingMessage)) return
      if (whatsapp.greetingMessage) {
        const debouncedSentMessage = debounce(
          async () => {
            await wbot.sendMessage(`${ticket.contactId}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
              { text: whatsapp.greetingMessage }
            )
          },
          1000,
          { leading: true }
        )
        debouncedSentMessage()
        return
      }
    }

    if (whatsapp.queues.length == 1 && ticket.queueId) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot)
      }
    }

    if (whatsapp.queues.length > 1 && ticket.queueId) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot, dontReadTheFirstQuestion)
      }
    }
  } catch (err) {
    console.error(err)
    Sentry.captureException(err)
    logger.error(`Erro no manuseio do mensagem whatsapp: Err: ${err}`)
  }
}

export default handleMessage