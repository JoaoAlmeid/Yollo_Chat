import { Request, Response } from 'express'
import ListSettings from '../../services/setting/ListSettings'
import UpdateSetting from '../../services/setting/UpdateSettings'
import AppError from '../../errors/AppError'
import { getIO } from 'src/libs/socket'


class SettingController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user

      if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }

      const settings = await ListSettings(companyId)

      return res.status(200).json(settings)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar configuração" })
      throw new AppError(`Ocorreu um erro ao recuperar configuração: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403)
    }

    try {
      const { settingKey: key } = req.params
      const { value } = req.body
      const { companyId } = req.user

      const setting = await UpdateSetting(key, value, companyId)

      const io = getIO()
      io.emit(`company-${companyId}-settings`, {
        action: "update",
        setting
      })

      return res.status(200).json(setting)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar configuração" })
      throw new AppError(`Ocorreu um erro ao atualizar configuração: ${error.message}`, 500)
    }
  }
}

export default new SettingController()