import { campaignQueue } from '../../queues'
import prisma from '../../prisma/client'
import AppError from 'src/errors/AppError'

export async function cancelService(id: number) {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id } })

    if (!campaign) {
      throw new AppError(`Campanha ${id}: não encontrada.`, 404)
    }

    await prisma.campaign.update({
      where: {
        id,
      },
      data: {
        status: 'CANCELADA',
      },
    })

    const recordsToCancel = await prisma.campaignShipping.findMany({
      where: {
        campaignId: id,
        jobId: { not: null },
        deliveredAt: { equals: null },
      }
    })

    const promises = []

    for (const record of recordsToCancel) {
      const job = await campaignQueue.getJob(Number(record.jobId))
      if (job) {
        promises.push(job.remove())
      }
    }

    await Promise.all(promises)

    return { success: true, message: `Campanha ${id}: cancelada com sucesso` }
  } catch (error: any) {
    console.error(`Erro ao cancelar campanha: ${error}`)
    throw new AppError(`Erro interno no servidor ao cancelar campanha: ${error.message}`, 500)
  }
}
