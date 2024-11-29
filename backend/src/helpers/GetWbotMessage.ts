import { proto } from '@whiskeysockets/baileys'
import { Ticket, Message } from '@prisma/client'
import AppError from '../errors/AppError'
import GetMessage from '../services/message/Get'
import GetTicketWbot from './GetTicketWbot'

export const GetWbotMessage = async (ticket: Ticket, messageId: string): Promise<proto.WebMessageInfo | Message> => {
  const getSock = await GetTicketWbot(ticket)
 
  // Função para buscar mensagens de forma gradual
  const fetchWbotMessagesGradually = async (): Promise<proto.WebMessageInfo | Message | null> => {
    const msgFound = await GetMessage({ id: messageId })
    if (msgFound && isWebMessageInfo(msgFound)) return msgFound
    return null
  }

  try {
    const msgFound = await fetchWbotMessagesGradually()

    if (!msgFound) {
      throw new AppError('Não foi possível encontrar a mensagem nas últimas 100 mensagens')
    }

    // Se não for encontrada no tipo WebMessageInfo, retorna como Message
    if (!isWebMessageInfo(msgFound)) {
      return msgFound as Message
    }

    return msgFound
  } catch (err) {
    console.error(err)
    throw new AppError(`Erro ao buscar mensagem: ${err.message}`, 500)
  }
}

// Verificação WebMessageInfo
function isWebMessageInfo(obj: any): obj is proto.WebMessageInfo {
  return obj && obj.key && obj.message
}

export default GetWbotMessage
