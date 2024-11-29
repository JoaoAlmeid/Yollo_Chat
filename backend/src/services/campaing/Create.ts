import * as Yup from 'yup'
import { Campaign } from '@prisma/client'
import prisma from '../../prisma/client'
import { DataCampaing } from './types'
import AppError from 'src/errors/AppError'

const createCampaignService = async (data: DataCampaing): Promise<Campaign> => {
  try {
    const { 
      name, 
      scheduledAt, 
      confirmation, 
      contactListId, 
      fileListId, 
      mediaPath, 
      mediaName, 
      companyId,
      whatsappId
    } = data
    
    const validSchema = Yup.object().shape({
      name: Yup.string()
        .min(3, 'Erro: nome da campanha inválido')
        .required('Erro: nome da campanha é requerido')
    })

    await validSchema.validate({ name }).catch((error) => {
      throw new AppError(error.message, 400)
    })

    if (scheduledAt) {
      data.status = 'PROGRAMADA'
    }

    const newCampaing = await prisma.campaign.create({
      data: {
        name: data.name,
        status: data.status,
        confirmation: confirmation || false,
        mediaName: mediaPath || null,
        mediaPath: mediaName || null,

        // Conectar a lista de contatos
        contactList: {
          connect: { id: contactListId }
        },

        // Conectar a lista de arquivos
        fileList: {
          connect: { id: fileListId }
        },

        // Conectar à empresa
        company: {
          connect: { id: companyId }
        },

        // Associar ao whatsapp
        whatsapp: {
          connect: { id: whatsappId }
        },

        scheduledAt,
      },
      include: {
        contactList: true,
        whatsapp: {
          select: { id: true, name: true }
        }
      }
    })


    return newCampaing
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error)
    throw new AppError(`Erro interno ao criar campanha: ${error.message}`, 500)
  }
}

export default createCampaignService