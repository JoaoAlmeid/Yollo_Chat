import { proto } from '@whiskeysockets/baileys'
import { Ticket, Contact, Message } from '@prisma/client'
import ShowWhatsAppService from '../../../../services/whatsapp/ShowWhatsApp'
import UpdateTicketService from '../../../../services/tickets/UpdateTicket'
import getBodyMessage from '../get/getBodyMessage'
import prisma from '../../../../prisma/client'
import moment from 'moment'
import verifyMessage from './verifyMessage'
import formatBody from '../../../../helpers/Mustache'
import { Session } from '../../../../@types/Session'
import ShowQueueIntegrationService from '../../../queueIntegration/ShowQueueIntegrationService'
import handleOpenAi from '../handleOpenAi'
import AppError from '../../../../errors/AppError'
import FindOrCreateATicketTraking from '../../../tickets/FindOrCreateATicketTraking'
import { head } from 'lodash'

interface IButton {
  buttonId: string
  buttonText: IButtonText
  buttonAction: string
  buttonParams: { text: string }
}

interface IButtonText { text: string }
type WAButton = proto.Message.ButtonsMessage.IButton

const verifyQueue = async (wbot: Session, msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact, mediaSent?: Message | undefined) => {
  try {
    const companyId = ticket.companyId
    const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(wbot.id!, ticket.companyId)

    // Verifica se há apenas uma fila disponivel
    if (queues.length === 1) {
      const firstQueue = head(queues)
      let chatbot = false
      if (firstQueue?.options) {
        chatbot = firstQueue.options.length > 0
      }

      // Inicia integração dialogflow/n8n
      if (!msg.key.fromMe && !ticket.isGroup && firstQueue.integrationId) {
        const integrations = await ShowQueueIntegrationService(firstQueue.integrationId, companyId)
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            useIntegration: true,
            integrationId: integrations.id
          }
        })
      }

      // Inicia a integração OpenAi
      if (!msg.key.fromMe && !ticket.isGroup && firstQueue.promptId) {
        await handleOpenAi(msg, wbot, ticket, contact, mediaSent)

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            useIntegration: true,
            promptId: firstQueue.promptId
          }
        })
      }

      await UpdateTicketService({
        ticketData: { queueId: firstQueue?.id, chatbot },
        ticketId: ticket.id,
        companyId: ticket.companyId,
      })

      return
    }

    // Caso existam múltiplas filas
    const selectedOption = getBodyMessage(msg)
    if (!selectedOption) { throw new Error('Opção de fila selecionada é inválida.') }

    const chosenQueue = queues[+selectedOption - 1]
    if (!chosenQueue) { throw new Error('Opção de fila selecionada é inválida.') }

    const buttonActive = await prisma.setting.findFirst({
      where: {
        key: "chatBotType",
        companyId
      }
    })

    const botText = async () => {
      let options = ""
      queues.forEach((queue, index) => {
        options += `*[ ${index + 1} ]* - ${queue.name}\n`
      })

      const textMessage = { text: formatBody(`\u200e${greetingMessage}\n\n${options}`, contact) }

      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        textMessage
      )

      await verifyMessage(sendMsg, ticket, contact)
    }

    if (chosenQueue) {
      let chatbot = chosenQueue.options.length > 0

      await UpdateTicketService({
        ticketData: { queueId: chosenQueue.id, chatbot },
        ticketId: ticket.id,
        companyId: ticket.companyId,
      })

      if (chosenQueue.options.length === 0) {
        const queue = await prisma.queue.findUnique({ where: { id: chosenQueue.id } })
        if (!queue) {throw new AppError(`Fila com Id: ${chosenQueue.id}, não encontrada.`, 404)}
  
        const schedules = queue.schedules ? JSON.parse(queue.schedules as string) : [];
  
        const now = moment()
        let schedule
  
        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(s => {
            if (typeof s.scheduleInfo === 'object' && s.scheduleInfo !== null) {
              const { startTime, endTime } = s.scheduleInfo as {
                startTime: string
                endTime: string
              }
              return moment(now).isBetween(
                moment(startTime, 'HH:mm'),
                moment(endTime, 'HH:mm')
              )
            }
            return false
          })
        }
  
        if (queue.outOfHoursMessage && !schedule) {
          const body = await formatBody(
            `${queue.outOfHoursMessage}\n\n*[ # ]* - Voltar para o menu principal`,
            contact
          )
  
          const buttons: IButton[] = queues.map((queue, index) => ({
            buttonId: `queue_${queue.id}`,
            buttonText: { text: queue.name },
            buttonAction: 'send_text_message',
            buttonParams: {
              text: 'Voltar para o menu principal',
            },
          }))
  
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
            { text: body, buttons: buttons as WAButton[] }
          )
  
          await verifyMessage(sentMessage, ticket, contact)
  
          await UpdateTicketService({
            ticketData: { queueId: null, chatbot },
            ticketId: ticket.id,
            companyId: ticket.companyId,
          })
  
          return
        }
      }
    } else {
      if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
        // await UpdateTicketService({
        //  ticketData: { queueId: queues[0].id },
        //  ticketId: ticket.id
        // })
        return
      }

      // Desabilita o chatbot por x min/hor após o primeiro envio
      const ticketTracking = await FindOrCreateATicketTraking({ ticketId: ticket.id, companyId })
      let dataLimite = new Date()
      let Agora = new Date()

      if (ticketTracking.chatbotAt !== null) {
        dataLimite.setMinutes(ticketTracking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)))

        if (
          ticketTracking.chatbotAt !== null && 
          Agora < dataLimite && 
          timeUseBotQueues !== "0" && 
          ticket.amountUsedBotQueues !== 0
        ) return
      }
      await prisma.ticketTracking.update({
        where: { id: ticketTracking.id },
        data: { chatbotAt: null }
      })

      if (buttonActive.value === 'text') { return botText() }
    } 
  } catch (error: any) {
    console.error('Erro ao verificar fila:', error)
    throw new Error('Erro ao verificar fila.')
  }
}

export default verifyQueue