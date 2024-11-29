import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { campaignQueue } from '../../queues'

export async function restartCampaign(id: number) {
  try {
    if (isNaN(id)) {
      throw new AppError(`ID inválido fornecido: ${id}`, 400)
    }

    const campanha = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campanha) {
      throw new AppError(`Campanha ${id}: não encontrada.`, 404)
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: 'EM_ANDAMENTO' },
    })

    await campaignQueue.add('ProcessCampaign', {
      id: campanha.id,
      delay: 3000,
    })
  } catch (error: any) {
    console.error(`Erro ao reiniciar campanha: ${error}`)
    throw new AppError(`Erro interno ao reiniciar campanha: ${error.message}`, 500)
  }
}