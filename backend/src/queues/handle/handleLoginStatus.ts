import prisma from '../../prisma/client'
import Sentry from '@sentry/node'
import { logger } from '../../utils/Logger'

export default async function handleLoginStatus(job: any) {
  try {
    // Busca usuários que precisam ser marcados como offline
    const users = await prisma.user.findMany({
      where: {
        online: true,
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        },
      },
      select: {
        id: true,
      },
    })

    for (const { id } of users) {
      try {
        // Atualiza o status do usuário para offline
        await prisma.user.update({
          where: { id },
          data: { online: false },
        })
        logger.info(`Usuário passado para offline: ${id}`)
      } catch (e: any) {
        Sentry.captureException(e)
        logger.error(
          `Erro ao atualizar o status do usuário ${id}: ${e.message}`
        )
      }
    }
  } catch (e: any) {
    Sentry.captureException(e)
    logger.error(
      `Erro ao buscar usuários para atualização de status: ${e.message}`
    )
  } finally {
    await prisma.$disconnect() // Certifique-se de desconectar o Prisma
  }
}
