import { Ticket, Contact } from '@prisma/client'
import { readFileSync } from 'fs'
import formatBody from '../../../../helpers/Mustache'
import verifyMessage from '../verify/verifyMessage'
import makeid from '../MakeId'
import { WASocket } from '@whiskeysockets/baileys'
import { MyStore } from 'src/@types/Store'

type Session = WASocket & {
  id?: number
  store?: MyStore
}

const sendMessageLink = async (wbot: Session, contact: Contact, ticket: Ticket, url: string, caption: string) => {
  let sentMessage
  try {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
      {
        document: url ? { url } : readFileSync(`public/temp/${caption}-${makeid(10)}`),
        fileName: caption,
        caption: caption,
        mimetype: 'application/pdf',
      }
    )
  } catch (error: any) {
    sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
      {
        text: formatBody('Não consegui enviar o PDF, tente novamente!', contact),
      }
    )
  }
  verifyMessage(sentMessage, ticket, contact)
}

export default sendMessageLink