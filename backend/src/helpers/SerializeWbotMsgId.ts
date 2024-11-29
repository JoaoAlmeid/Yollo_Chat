import { Ticket, Message } from '@prisma/client'

const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {
  const serializedMsgId = `${message.fromMe}_${ticket.contactId}@${
    ticket.isGroup ? 'g' : 'c'
  }.us_${message.id}`

  return serializedMsgId
}

export default SerializeWbotMsgId
