import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'

import ListSettingCampaigns from '../../services/campaingSetting/List'
import CreateCampaignSetting from '../../services/campaingSetting/Create'

class CampaignSettingsController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const settings = await ListSettingCampaigns({ companyId })
      return res.status(200).json(settings)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar configurações das campanhas" })
      throw new AppError(`Ocorreu um erro ao recuperar configurações das campanhas: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body
      const createdSettings = await CreateCampaignSetting(data, companyId)
      return res.status(200).json(createdSettings)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar configurações da campanha" })
      throw new AppError(`Ocorreu um erro ao criar configurações da campanha: ${error.message}`, 500)
    }
  }
}

export default new CampaignSettingsController()