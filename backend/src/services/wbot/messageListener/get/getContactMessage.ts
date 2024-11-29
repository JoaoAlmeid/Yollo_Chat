import { proto } from '@whiskeysockets/baileys'
import getSenderMessage from './getSenderMessage'
import { Session } from '../../../../@types/Session'

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  if (!msg.key || !msg.key.remoteJid) {
    throw new Error("Propriedade 'key' ou 'remoteJid' não encontrada em msg")
  }

  const isGroup = msg.key.remoteJid.includes('g.us')
  const rawNumber = msg.key.remoteJid.replace(/\D/g, '')

  return isGroup
    ? {
        id: getSenderMessage(msg, wbot),
        name: msg.pushName || 'Grupo',
      }
    : {
        id: msg.key.remoteJid,
        name: msg.key.fromMe ? rawNumber : msg.pushName,
      }
}

export default getContactMessage