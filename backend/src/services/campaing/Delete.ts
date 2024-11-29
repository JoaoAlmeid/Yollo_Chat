import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const deleteCampaignService = async (id: string): Promise<void> => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
    })

    if (!campaign) {
      throw new AppError('Erro: Campanha não encontrada', 404)
    }

    if (campaign.status === 'EM_ANDAMENTO') {
      throw new AppError('Não é permitido excluir campanha em andamento', 400)
    }

    await prisma.campaign.delete({
      where: { id: parseInt(id) },
    })
  } catch (error: any) {
    console.error(`Erro ao deletar campanha: ${error}`)
    throw new AppError(`Erro interno ao deletar campanha: ${error.message}`, 500)
  }
}

export default deleteCampaignService