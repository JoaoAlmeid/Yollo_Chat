import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { CampaignSetting } from '@prisma/client'

interface Request {
  companyId: number | string
  searchParam?: string
  pageNumber?: string
}

const ListSettingCampaigns = async ({ companyId }: Request): Promise<CampaignSetting[]> => {
  try {
    let whereCondition: any = { companyId }
    
    const settings = await prisma.campaignSetting.findMany({
      where: whereCondition
    })

    return settings
  } catch (error: any) {
    console.error(`Erro ao listar configurações de campanha: ${error}`) 
    throw new AppError(`Erro interno ao listar configurações de campanha: ${error}`, 500)
  }
}

export default ListSettingCampaigns