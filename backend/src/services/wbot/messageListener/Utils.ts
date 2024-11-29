import { Contact, Ticket } from '@prisma/client'
import fs from 'fs'
import UpdateTicket from '../../tickets/UpdateTicket'

export const sanitizeName = (name: string): string => {
    let sanitized = name.split(" ")[0]
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "")
    return sanitized.substring(0, 60)
}

export const deleteFileSync = (path: string): void => {
    try {
      fs.unlinkSync(path)
    } catch (error: any) {
      console.error("Erro ao deletar o arquivo:", error)
    }
}

export const keepOnlySpecifiedChars = (str: string) => {
  return str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕçÇ!?.,;:\s]/g, "")
}

export const transferQueue = async (queueId: number, ticket: Ticket, contact: Contact): Promise<void> => {
    await UpdateTicket({
      ticketData: { queueId: queueId, useIntegration: false, promptId: null },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });
  };