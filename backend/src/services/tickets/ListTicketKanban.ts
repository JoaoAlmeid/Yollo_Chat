import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import ShowUser from '../../services/user/ShowUser'
import prisma from '../../prisma/client'
import { RequestListTicket, ResponseListTicket } from '../../@types/Tickets'

const ListTicketsKanban = async ({
  searchParam = '',
  pageNumber = '1',
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId,
}: RequestListTicket): Promise<ResponseListTicket> => {
  let whereCondition: Prisma.TicketWhereInput = {
    OR: [{ userId: parseInt(userId) }, { status: 'pending' }],
    queueId: { in: queueIds.filter(id => id !== null) },
  }
  const includeCondition: Prisma.TicketInclude = {
    contact: { select: { id: true, name: true, number: true, email: true } },
    queue: { select: { id: true, name: true, color: true } },
    user: { select: { id: true, name: true } },
    whatsapp: { select: { name: true } },
  }

  if (showAll === 'true') {
    whereCondition = { queueId: { in: queueIds.filter(id => id !== null) } }
  }

  whereCondition = {
    ...whereCondition,
    OR: [{ status: 'pending' }, { status: 'open' }],
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLowerCase().trim()

    includeCondition.messages = {
      select: { id: true, body: true },
      where: { body: { contains: sanitizedSearchParam } },
    }

    whereCondition = {
      ...whereCondition,
      OR: [
        { contact: { name: { contains: sanitizedSearchParam } } },
        { contact: { number: { contains: sanitizedSearchParam } } },
        { messages: { some: { body: { contains: sanitizedSearchParam } } } },
      ],
    }
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        gte: startOfDay(parseISO(date)),
        lte: endOfDay(parseISO(date)),
      },
    }
  }

  if (updatedAt) {
    whereCondition = {
      ...whereCondition,
      updatedAt: {
        gte: startOfDay(parseISO(updatedAt)),
        lte: endOfDay(parseISO(updatedAt)),
      },
    }
  }

  if (withUnreadMessages === 'true') {
    const user = await ShowUser(userId)
    const userQueueIds = user.queues.map(queue => queue.id)

    whereCondition = {
      OR: [{ userId: parseInt(userId) }, { status: 'pending' }],
      queueId: { in: queueIds.filter(id => id !== null) },
      unreadMessages: { gt: 0 },
      ...whereCondition,
    }
  }

  if (Array.isArray(tags) && tags.length > 0) {
    const ticketsTagFilter: number[][] = await Promise.all(
      tags.map(async tag => {
        const ticketTags = await prisma.ticketTag.findMany({
          where: { tagId: tag },
        })
        return ticketTags.map(t => t.ticketId)
      })
    )

    const ticketsIntersection: number[] =
      ticketsTagFilter.length > 0
        ? ticketsTagFilter.reduce((a, b) => a.filter(c => b.includes(c)))
        : []

    whereCondition = {
      ...whereCondition,
      id: { in: ticketsIntersection },
    }
  }

  if (Array.isArray(users) && users.length > 0) {
    const ticketsUserFilter: number[][] = await Promise.all(
      users.map(async user => {
        const ticketUsers = await prisma.ticket.findMany({
          where: { userId: user },
        })
        return ticketUsers.map(t => t.id)
      })
    )

    const ticketsIntersection: number[] =
      ticketsUserFilter.length > 0
        ? ticketsUserFilter.reduce((a, b) => a.filter(c => b.includes(c)))
        : []

    whereCondition = {
      ...whereCondition,
      id: { in: ticketsIntersection },
    }
  }

  const limit = 40
  const offset = limit * (parseInt(pageNumber) - 1)

  whereCondition = {
    ...whereCondition,
    companyId: parseInt(companyId),
  }

  const tickets = await prisma.ticket.findMany({
    where: whereCondition,
    include: includeCondition,
    take: limit,
    skip: offset,
    orderBy: { updatedAt: 'desc' },
  })

  const count = await prisma.ticket.count({ where: whereCondition })

  const hasMore = count > offset + tickets.length

  return {
    tickets,
    count,
    hasMore,
  }
}

export default ListTicketsKanban
