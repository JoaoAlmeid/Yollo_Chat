import { proto } from '@whiskeysockets/baileys'
import { Message } from '@prisma/client'
import prisma from '../../../../prisma/client'
import { getQuotedMessage } from '../get/getQuotedMessage'

const verifyQuotedMessage = async (msg: proto.IWebMessageInfo): Promise<Message | null> => {
  if (!msg) return null
  const quotedId: string | null = getQuotedMessage(msg)
  if (!quotedId) return null

  try {
    const quotedMsg = await prisma.message.findUnique({
      where: { id: quotedId },
    })
  
    return quotedMsg || null
  } catch (error: any) {
    console.error('Erro ao buscar mensagem citada:', error)
    return null
  }
}

export default verifyQuotedMessage