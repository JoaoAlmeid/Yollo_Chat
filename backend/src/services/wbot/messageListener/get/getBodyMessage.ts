import { proto } from '@whiskeysockets/baileys'
import { Buffer } from 'buffer'
import getBodyButton from './getBodyButton'
import getTypeMessage from './getTypeMessage'
import msgLocation from '../Location'
import { logger } from '../../../../utils/Logger'
import * as Sentry from '@sentry/node'

const getBodyMessage = (msg: proto.IWebMessageInfo): string => {
  try {
    let type = getTypeMessage(msg)
    const types = {
      conversation: msg?.message?.conversation,
	    editedMessage: msg?.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      extendedTextMessage: msg.message?.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message?.buttonsResponseMessage?.selectedButtonId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo: msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.title,
      buttonsMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      viewOnceMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage: "varios contatos",
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail
          ? Buffer.from(msg.message.locationMessage.jpegThumbnail) : undefined,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.title,
      documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption,
      audioMessage: "Áudio",
      listMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.title,
      listResponseMessage: msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      reactionMessage: msg.message?.reactionMessage?.text || "reaction",
    }

    const objKey = Object.keys(types).find(key => key === type)

    if (!objKey) {
      logger.warn(`#### Não achou o tipo: ${type} ${JSON.stringify(msg)}`)
      Sentry.setExtra('Mensagem', { BodyMsg: msg.message, msg, type })
      Sentry.captureException(new Error('Novo Tipo de Mensagem em getTypeMessage'))
    }
    return types[type]
  } catch (error: any) {
    Sentry.setExtra('Erro ao chamar o tipo da mensagem', { msg, BodyMsg: msg.message })
    Sentry.captureException(error)
    console.log(error)
  }
}

export default getBodyMessage