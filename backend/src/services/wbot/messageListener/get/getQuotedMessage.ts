import { proto, extractMessageContent } from '@whiskeysockets/baileys'

// Função para obter a citação de uma mensagem recebida
export const getQuotedMessage = (msg: proto.IWebMessageInfo): any => {
  const contextInfo =
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.documentMessage?.contextInfo ||
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.buttonsResponseMessage?.contextInfo ||
    msg.message?.listResponseMessage?.contextInfo ||
    msg.message?.templateButtonReplyMessage?.contextInfo;

  if (contextInfo?.quotedMessage) {
    return extractMessageContent(contextInfo.quotedMessage)
  }

  return null
}

// Função para obter o ID da citação de uma mensagem recebida
export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const contextInfo = 
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.documentMessage?.contextInfo ||
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.buttonsResponseMessage?.contextInfo ||
    msg.message?.listResponseMessage?.contextInfo ||
    msg.message?.templateButtonReplyMessage?.contextInfo;

  if (contextInfo?.stanzaId) {
    return contextInfo.stanzaId
  }

  return null
}