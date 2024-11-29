import * as Sentry from '@sentry/node'
import { Job } from 'bull'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import moment from 'moment'
import { getIO } from '../../libs/socket'

export default async function handleVerifyQueue(job: Job) {
  logger.info('Buscando atendimentos perdidos nas filas')

  try {
    const companies = await prisma.company.findMany({
      where: {
        status: true,
        dueDate: {
          gt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        name: true,
        whatsapps: {
          select: {
            id: true,
            name: true,
            status: true,
            timeSendQueue: true,
            sendIdQueue: true,
          },
          where: {
            timeSendQueue: {
              gt: 0,
            },
          },
        },
      },
    })

    for (const company of companies) {
      for (const whatsapp of company.whatsapps) {
        // Certifique-se de que este é o nome correto
        if (whatsapp.status === 'CONNECTED') {
          const moveQueue = whatsapp.timeSendQueue ? whatsapp.timeSendQueue : 0
          const moveQueueId = whatsapp.sendIdQueue
          const moveQueueTime = moveQueue

          if (moveQueue > 0) {
            if (
              !isNaN(moveQueueId) &&
              Number.isInteger(moveQueueId) &&
              !isNaN(moveQueueTime) &&
              Number.isInteger(moveQueueTime)
            ) {
              const tempoPassado = moment()
                .subtract(moveQueueTime, 'minutes')
                .utc()
                .format()

              const tickets = await prisma.ticket.findMany({
                where: {
                  status: 'pending',
                  queueId: {
                    equals: null as any,
                  },
                  companyId: company.id,
                  whatsappId: whatsapp.id,
                  updatedAt: {
                    lt: new Date(tempoPassado),
                  },
                },
                include: {
                  contact: {
                    select: {
                      id: true,
                      name: true,
                      number: true,
                      email: true,
                      profilePicUrl: true,
                      extraInfo: true,
                    },
                  },
                },
              })

              if (tickets.length > 0) {
                for (const ticket of tickets) {
                  await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { queueId: moveQueueId },
                  })

                  const updatedTicket = await prisma.ticket.findUnique({
                    where: { id: ticket.id },
                    include: {
                      contact: true,
                    },
                  })

                  const io = getIO()
                  io.to(ticket.status)
                    .to('notification')
                    .to(ticket.id.toString())
                    .emit(`company-${company.id}-ticket`, {
                      action: 'update',
                      ticket: ticket,
                      ticketId: ticket.id,
                    })

                  logger.info(
                    `Atendimento Perdido: ${ticket.id} - Empresa: ${company.id}`
                  )
                }
              } else {
                logger.info(
                  `Nenhum atendimento perdido encontrado - Empresa: ${company.id}`
                )
              }
            } else {
              logger.info(`Condição não respeitada - Empresa: ${company.id}`)
            }
          }
        }
      }
    }
  } catch (e: any) {
    Sentry.captureException(e)
    logger.error('SearchForQueue -> VerifyQueue: error', e.message)
    throw e
  }
}
