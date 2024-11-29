import { WASocket } from '@whiskeysockets/baileys'
import { getWbot } from '../libs/wbot'
import GetDefaultWhatsApp from './GetDefaultWhatsApp'
import prisma from '../prisma/client'
import { Ticket } from '@prisma/client'
import { MyStore } from 'src/@types/Store'
import AppError from '../errors/AppError'

type Session = WASocket & {
  id?: number
  store?: MyStore
}

const GetTicketWbot = async (ticket: Ticket): Promise<Session> => {
  if (!ticket.whatsappId) {
    const defaultWhatsapp = await GetDefaultWhatsApp(ticket.userId)

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { whatsappId: defaultWhatsapp.id },
    })

    ticket.whatsappId = defaultWhatsapp.id
  }

  const wbot = getWbot(ticket.whatsappId)

  if (!wbot) {
    throw new AppError(
      `Nenhum Wbot encontrado para o Id do WhatsApp ${ticket.whatsappId}`
    )
  }

  return wbot
}

export default GetTicketWbot
