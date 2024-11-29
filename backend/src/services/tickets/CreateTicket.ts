import AppError from '../../errors/AppError'
import CheckContactOpenTickets from '../../helpers/CheckContactOpenTickets'
import GetDefaultWhatsApp from '../../helpers/GetDefaultWhatsApp'
import ShowContactService from '../contact/Show'
import { getIO } from '../../libs/socket'
import { Ticket } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestTicket } from '../../@types/Tickets'

const CreateTicket = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
  whatsappId
}: RequestTicket): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId)
  await CheckContactOpenTickets(contactId)
  const { isGroup } = await ShowContactService(contactId, companyId)

  const existingTicket = await prisma.ticket.findFirst({
    where: { contactId, companyId }
  })

  const data: any ={
    companyId,
    whatsappId: defaultWhatsapp.id,
  }

  if (existingTicket) {
    data.userId = userId;
    data.status = 'open';
  } else {
    data.contactId = contactId;
    data.status = status;
    data.isGroup = isGroup;
    data.userId = userId;
  }

  if (queueId !== undefined) {
    data.queueId = queueId;
  }

  const ticket = existingTicket 
    ? await prisma.ticket.update({
      where: { id: existingTicket.id },
      data,
      include: { contact: true, queue: true }
    })
    : await prisma.ticket.create({
      data,
      include: { contact: true, queue: true }
    })

  const io = getIO()
  io.to(ticket.id.toString()).emit('ticket', {
    action: 'update',
    ticket,
  })

  return ticket
}

export default CreateTicket
