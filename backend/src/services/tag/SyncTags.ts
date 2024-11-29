import prisma from '../../prisma/client'
import { Ticket } from '@prisma/client'
import { RequestShowTag } from '../../@types/Tag'

const SyncTags = async ({
  tags,
  ticketId,
}: RequestShowTag): Promise<Ticket | null> => {
  // Encontrar o ticket com base no ticketId
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  })

  if (!ticket) {
    throw new Error(`Ticket com ID ${ticketId} não encontrado.`)
  }

  // Preparar a lista de tags para o relacionamento
  const tagList = tags.map(t => ({
    tagId: t.id,
    ticketId,
    updatedAt: new Date(), // Inclua a data de atualização se necessário
  }))

  // Excluir todas as tags associadas ao ticket
  await prisma.ticketTag.deleteMany({
    where: { ticketId },
  })

  // Criar novas associações entre tags e o ticket
  await prisma.ticketTag.createMany({
    data: tagList,
  })

  // Atualizar o ticket (o Prisma faz isso automaticamente após criar novas associações)
  const updatedTicket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  })

  return updatedTicket
}

export default SyncTags
