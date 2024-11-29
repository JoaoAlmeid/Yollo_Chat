import { proto } from '@whiskeysockets/baileys'
import AppError from '../../../../errors/AppError'

const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  try {
    const viewOnceMessage = msg?.message?.viewOnceMessage?.message
  
    if (msg.key.fromMe && viewOnceMessage?.buttonsMessage?.contentText) {
      let bodyMessage = `*${viewOnceMessage.buttonsMessage.contentText}*`
  
      for (const button of viewOnceMessage.buttonsMessage.buttons ?? []) {
        bodyMessage += `\n\n${button.buttonText?.displayText ?? ''}`
      }
      return bodyMessage
    }
  
    if (msg.key.fromMe && viewOnceMessage?.listMessage) {
      let bodyMessage = `*${viewOnceMessage.listMessage.description}*`
      const sections = viewOnceMessage.listMessage.sections ?? []
  
      for (const section of sections) {
        for (const row of section.rows ?? []) {
          bodyMessage += `\n\n${row.title ?? ''}`
        }
      }
      return bodyMessage
    }
  } catch (error: any) {
    console.error(error.message)
    throw new AppError(`Erro desconhecido: ${error.message}`, 500)
  }
}

export default getBodyButton