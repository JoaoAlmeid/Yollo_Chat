import { Ticket, TicketTracking } from "@prisma/client"
import verifyRating from "./verify/verifyRating"
import { getIO } from "../../../libs/socket"
import AppError from "../../../errors/AppError"
import ShowWhatsApp from "../../whatsapp/ShowWhatsApp"
import prisma from "../../../prisma/client"
import formatBody from "../../../helpers/Mustache"
import SendWhatsAppMessage from "../SendWhatsAppMessage"
import moment from "moment"

const handleRating = async (rate: number,  ticket: Ticket, ticketTraking: TicketTracking) => {
    try {
      // Verifica se o rastreamento é válido para avaliação
      if (!verifyRating(ticketTraking)) {
        throw new AppError('Rastreamento de ticket inválido para classificação', 400)
      }
  
      const io = getIO()
  
      // Obtém as informações do WhatsApp relacionadas ao ticket
      const { complationMessage } = await ShowWhatsApp(
        ticket.whatsappId,
        ticket.companyId
      )
  
      if (!complationMessage) {
        throw new Error('Mensagem de conclusão não disponivel.')
      }
  
      // Ajusta a nota para estar entre 1 e 5
      let finalRate = rate
      if (rate < 1) { finalRate = 1 }
      if (rate > 5) { finalRate = 5 }
  
      await prisma.userRating.create({
        data: {
          ticketId: ticketTraking.ticketId,
          companyId: ticketTraking.companyId,
          userId: ticketTraking.userId,
          rate: finalRate,
          updatedAt: new Date(),
        },
      })
  
      // Envia uma mensagem de conclusão via WhatsApp
      if (complationMessage) {
        const contact = await prisma.contact.findFirst({ where: { id: ticket.contactId } })
  
        if (!contact) {
          throw new Error('Contato não encontrado.')
        }
  
        const body = formatBody(`\u200e${complationMessage}`, contact)
        await SendWhatsAppMessage({ body, ticket })
      }
  
      // Atualiza o ticket tracking para marcar como finalizado e avaliado
      await prisma.ticketTracking.update({
        where: { id: ticketTraking.id },
        data: {
          finishedAt: moment().toDate(),
          rated: true,
        },
      })
  
      // Atualiza o ticket para marcar como fechado
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          queueId: null,
          chatbot: null,
          queueOptionId: null,
          userId: null,
          status: 'closed',
        },
      })
  
      // Emite eventos para atualizar a interface do usuário
      io.to('open').emit(`company-${ticket.companyId}-ticket`, {
        action: 'delete',
        ticket,
        ticketId: ticket.id,
      })
  
      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: 'update',
          ticket,
          ticketId: ticket.id,
        })
    } catch (error: any) {
      console.error('Erro no manuseio da classificação:', error)
      throw new Error('Erro no manuseio da classificação.')
    }
}

export default handleRating