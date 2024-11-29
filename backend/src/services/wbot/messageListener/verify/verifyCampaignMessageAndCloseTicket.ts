import { proto } from '@whiskeysockets/baileys'
import getBodyMessage from '../get/getBodyMessage'
import { getIO } from '../../../../libs/socket'
import prisma from '../../../../prisma/client'

const verifyCampaignMessageAndCloseTicket = async (message: proto.IWebMessageInfo, companyId: number) => {
  const io = getIO()
  const body = getBodyMessage(message)
  const isCampaign = /\u200c/.test(body)

  if (message.key.fromMe && isCampaign) {
    const messageRecord = await prisma.message.findUnique({
      where: { id: message.key.id ?? '', companyId },
    })

    if (messageRecord) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: messageRecord.ticketId },
      })

      if (ticket) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'closed' },
        })

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
      }
    }
  }
}

export default verifyCampaignMessageAndCloseTicket