import * as Sentry from '@sentry/node'
import {
  MessageUpsertType,
  proto,
  WAMessageUpdate,
  WASocket,
} from '@whiskeysockets/baileys'
import filterMessages from './messageListener/filterMessages'
import handleMsgAck from './messageListener/handleMsgAck'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import handleMessage from './messageListener/handleMessage'
import verifyRecentCampaign from './messageListener/verify/verifyRecentCampaign'
import verifyCampaignMessageAndCloseTicket from './messageListener/verify/verifyCampaignMessageAndCloseTicket'
import { Session } from '../../@types/Session'

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[]
  type: MessageUpsertType
}

const wbotMessageListener = async (wbot: Session, companyId: number): Promise<void> => {
  try {
    wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
      const messages = messageUpsert.messages
        .filter(filterMessages)
        .map(msg => msg)

      if (!messages) return

      messages.forEach(async (message: proto.IWebMessageInfo) => {
        const messageExists = await prisma.message.count({
          where: {
            id: message.key.id!,
            companyId
          }
        })

        if (!messageExists) {
          await handleMessage(message, wbot, companyId)
          await verifyRecentCampaign(message, companyId)
          await verifyCampaignMessageAndCloseTicket(message, companyId)
        }
      })
    })

    wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return
      messageUpdate.forEach(async (message: WAMessageUpdate) => {
        (wbot as WASocket)!.readMessages([message.key])

        handleMsgAck(message, message.update.status)
      })
    })
  } catch (error: any) {
    Sentry.captureException(error)
    logger.error(`Erro ao lidar com o ouvinte de mensagens WBot: ${error}`)
  }
}

export default wbotMessageListener