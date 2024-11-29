import * as Sentry from '@sentry/node'
import { proto } from '@whiskeysockets/baileys'
import getTypeMessage from '../get/getTypeMessage'
import { logger } from '../../../../utils/Logger'

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === 'status@broadcast') return false

  try {
    const msgType = getTypeMessage(msg)
    if (!msgType) { return false }

    const validTypes = [
      'conversation',
      'extendedTextMessage',
      'editedMessage',
      'audioMessage',
      'videoMessage',
      'imageMessage',
      'documentMessage',
      'documentWithCaptionMessage',
      'stickerMessage',
      'buttonsResponseMessage',
      'buttonsMessage',
      'messageContextInfo',
      'locationMessage',
      'liveLocationMessage',
      'contactMessage',
      'voiceMessage',
      'mediaMessage',
      'contactsArrayMessage',
      'reactionMessage',
      'ephemeralMessage',
      'protocolMessage',
      'listResponseMessage',
      'listMessage',
      'viewOnceMessage',
    ]

    const ifType = validTypes.includes(msgType)
    if (!ifType) {
      logger.warn(`#### Não achou o tipo em isValidMsg: ${msgType}
  ${JSON.stringify(msg?.message)}`)
      Sentry.setExtra('Mensagem', { BodyMsg: msg.message, msg, msgType })
      Sentry.captureException(new Error('Novo Tipo de Mensagem em isValidMsg'))
    }

    return ifType
  } catch (error: any) {
    Sentry.setExtra('Error isValidMsg', { msg })
    Sentry.captureException(error)
    return false
  }
}

export default isValidMsg
