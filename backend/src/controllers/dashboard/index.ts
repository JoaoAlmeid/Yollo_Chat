import { Request, Response } from 'express'
import DashboardDataService, { DashboardData, Params } from '../../services/report/DashboardData'
import AppError from 'src/errors/AppError'

class DashboardController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const params: Params = req.query
      const { companyId } = req.user

      // Validação básica dos parêmetros
      if (!companyId) { throw new AppError('ID da empresa não fornecido', 400) }

      const dashboardData: DashboardData = await DashboardDataService(companyId, {...params})
      return res.json(dashboardData)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar dados do painel" })
      throw new AppError(`Ocorreu um erro ao recuperar dados do painel: ${error.message}`, 500)
    }
  }
}

export default new DashboardController()