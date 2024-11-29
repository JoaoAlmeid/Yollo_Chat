import { Campaign } from '@prisma/client'
import prisma from '../../prisma/client'
import { DataCampaing } from './types'
import AppError from 'src/errors/AppError'

const updateCampaign = async (data: DataCampaing): Promise<Campaign> => {
    try {
      const { id } = data

      const existingCampaign = await prisma.campaign.findUnique({
        where: { id: Number(id) }
      })

      if (!existingCampaign) {
        throw new AppError('Campanha não encontrada', 404)
      }

      if (["INATIVA", "PROGRAMADA", "CANCELADA"].indexOf(data.status) === -1) {
        throw new AppError(
          "Só é permitido alterar campanha Inativa e Programada",
          400
        );
      }

      if (
        data.scheduledAt != null &&
        data.scheduledAt != "" &&
        data.status === "INATIVA"
      ) {
        data.status = "PROGRAMADA";
      }

      // Atualiza a campanha no banco de dados
      const updatedCampaign = await prisma.campaign.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          message1: data.message1,
          message2: data.message2,
          message3: data.message3,
          message4: data.message4,
          message5: data.message5,
          confirmationMessage1: data.confirmationMessage1,
          confirmationMessage2: data.confirmationMessage2,
          confirmationMessage3: data.confirmationMessage3,
          confirmationMessage4: data.confirmationMessage4,
          confirmationMessage5: data.confirmationMessage5,
          status: data.status,
          confirmation: data.confirmation,
          mediaPath: data.mediaPath,
          mediaName: data.mediaName,
          scheduledAt: data.scheduledAt,
          companyId: data.companyId,
          contactListId: data.contactListId,
          whatsappId: data.whatsappId,
        },
      })

      return updatedCampaign
    } catch (error: any) {
      console.error(`Erro ao atualizar campanha: ${error}`)
      throw new AppError(`Erro interno ao atualizar campanha: ${error.message}`, 500)
    }
}

export default updateCampaign