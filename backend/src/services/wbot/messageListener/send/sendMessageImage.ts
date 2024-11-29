import { Ticket } from '@prisma/client'
import makeid from '../MakeId'
import formatBody from '../../../../helpers/Mustache'
import { readFileSync } from 'fs'
import verifyMessage from '../verify/verifyMessage'
import { WASocket } from '@whiskeysockets/baileys'
import { MyStore } from 'src/@types/Store'

type Session = WASocket & {
  id?: number
  store?: MyStore
}

const sendMessageImage = async (wbot: Session, contact, ticket: Ticket, url: string, caption: string) => {
  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
      {
        image: url
          ? { url }
          : readFileSync(`public/temp/${caption}-${makeid(10)}`), 
        fileName: caption,
        caption: caption,
        mimetype: 'image/jpeg',
      }
    )
  } catch (error: any) {
    const errorMessage = formatBody('Não consegui enviar o PDF, tente novamente!', contact)
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
      {
        text: errorMessage,
      }
    )
  }
  verifyMessage(sentMessage, ticket, contact)
}

export default sendMessageImage