import { Server as SocketIO } from 'socket.io'
import { Server } from 'http'
import AppError from '../errors/AppError'
import { logger } from '../utils/Logger'
import prisma from '../prisma/client'

let io: SocketIO | undefined

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    },
  })

  io.on('connection', async socket => {
    logger.info('Cliente Conectado')
    const userId = socket.handshake.query.userId as string

    if (userId && !isNaN(Number(userId))) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: Number(userId) },
        })
        if (user) {
          await prisma.user.update({
            where: { id: Number(userId) },
            data: { online: true },
          })
        }
        logger.info(`Status de usuário atualizado para online: ${userId}`)
      } catch (error: any) {
        logger.error(`Error ao atualizar status de usuário: ${error}`)
      }
    }

    socket.on('joinChatBox', (ticketId: string) => {
      logger.info(`Cliente entrou em um canal de ticket: ${ticketId}`)
      socket.join(ticketId)
    })

    socket.on('joinNotification', () => {
      logger.info('Cliente entrou em um canal de notificações')
      socket.join('notification')
    })

    socket.on('joinTickets', (status: string) => {
      logger.info(`Cliente entrou no canal de tickets com status ${status}`)
      socket.join(status)
    })

    socket.on('disconnect', async () => {
      if (userId && isNaN(Number(userId))) {
        try {
          await prisma.user.update({
            where: { id: Number(userId) },
            data: { online: false },
          })
          logger.info(`Cliente desconectado e status atualizado para offline: ${userId}`)
        } catch (error: any) {
          logger.error(
            `Erro ao atualizar status de usuário na desconexão: ${error}`
          )
        }
      }
    })
  })
  return io
}

export const ensureIOInitialized = async () => {
  if (!io) {
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (io) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
};

export const getIO = (): SocketIO => {
  if (!io) {
    logger.error('Tentativa de acessar Socket IO antes da inicialização')
    throw new AppError('Socket IO não inicializado', 400)
  }
  return io
}
