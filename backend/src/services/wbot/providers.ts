import { proto, WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import processSegundaVia from './provider/segundaVia'
import { processRelogue } from './provider/relogue'
import prisma from '../../prisma/client'
import { sendWAPPNullMessage } from './provider/utils/sendMessage'
import { Session } from 'src/@types/Session'

const updateTicketStatus = async (ticketId: number, status: string) => {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  })
}

const provider = async ( ticket: Ticket, msg: proto.IWebMessageInfo, contact: Contact, wbot: WASocket ) => {
  try {
    // Obter o ticket do banco de dados
    const existingticket = await prisma.ticket.findUnique({ where: { id: ticket.id } })

    if (!existingticket) {
      console.error('Ticket não encontrado:', ticket.id)
      await sendWAPPNullMessage(wbot, contact, 'Ticket não encontrado.')
      return
    }

    // Processar com base no tipo de ticket
    switch (ticket.queueId) {
      case 1:
        await processSegundaVia(ticket, msg, contact, wbot)
        break
      case 2:
        await processRelogue(ticket, msg, contact, wbot)
        break
      default:
        await sendWAPPNullMessage(
          wbot,
          contact,
          'Tipo de ticket não reconhecido.'
        )
        break
    }

    // Atualizar status do ticket se necessário
    await updateTicketStatus(ticket.id, 'Processado')
  } catch (error: any) {
    console.error('Erro ao processar ticket:', error)
    await sendWAPPNullMessage(
      wbot,
      contact,
      'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
    )
  }
}

export default provider