import { CampaignSetting } from '@prisma/client'
import { isArray, isObject } from 'lodash'
import prisma from '../../prisma/client'
import AppError from 'src/errors/AppError'

interface Data { settings: any }

const CreateCampaignSetting = async (data: Data, companyId: number): Promise<CampaignSetting[]> => {
  try {
    const settings: CampaignSetting[] = []

    for (const settingKey of Object.keys(data.settings)) {
      const value = isArray(data.settings[settingKey]) || isObject(data.settings[settingKey])
        ? JSON.stringify(data.settings[settingKey])
        : data.settings[settingKey]

      const existingSetting = await prisma.campaignSetting.findFirst({
        where: {
          key: settingKey,
          companyId
        }
      })


      if (existingSetting) {
        await prisma.campaignSetting.update({
          where: { id: existingSetting.id },
          data: { value }
        })

        settings.push(await prisma.campaignSetting.findUnique({ 
          where: { id: existingSetting.id } 
        }))
      } else {
        const newSetting = await prisma.campaignSetting.create({
          data: {
            key: settingKey,
            value,
            companyId
          }
        })
  
        settings.push(newSetting)
      }
    }

    return settings
  } catch (error: any) {
    console.error(`Erro ao criar configurações de campanha: ${error}`)
    throw new AppError(`Erro interno ao criar configurações de campanha: ${error.message}`, 500)
  }
}

export default CreateCampaignSetting