import { jidNormalizedUser, proto } from '@whiskeysockets/baileys'
import { Session } from '../../../../@types/Session'
import getMeSocket from './getMeSocket'

const getSenderMessage = (msg: proto.IWebMessageInfo, wbot: Session): string => {
  const me = getMeSocket(wbot)
  if (msg.key.fromMe) return me.id

  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid

  if (senderId) { return jidNormalizedUser(senderId) } 
  else { throw new Error('senderId não encontrado') }
}

export default getSenderMessage