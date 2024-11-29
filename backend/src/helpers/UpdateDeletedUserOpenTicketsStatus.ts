import { Ticket } from '@prisma/client'
import UpdateTicketService from '../services/tickets/UpdateTicket'

const UpdateDeletedUserOpenTicketsStatus = async (tickets: Ticket[], companyId: number): Promise<void> => {
  await Promise.all(tickets.map(t =>
    UpdateTicketService({
      ticketData: { status: 'pending' },
      ticketId: t.id,
      companyId,
    })
  ))
}

export default UpdateDeletedUserOpenTicketsStatus
