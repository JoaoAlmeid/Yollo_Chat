import { Request, Response } from 'express'
import ImportContactsService from '../../services/wbot/ImportContactsService'
import AppError from '../../errors/AppError'

class ImportPhoneController {
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const companyId = req.user
      
      if (typeof companyId !== 'string') {
        throw new AppError('companyId deve ser uma string', 400)
      }
  
      const companyIdNumber = Number(companyId)
      if (isNaN(companyIdNumber)) {
        throw new AppError('companyId deve ser um número válido', 400)
      }
  
      await ImportContactsService(companyIdNumber)
  
      return res.status(200).json({ message: 'Contatos importados.' })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar importação" })
      throw new AppError(`Ocorreu um erro ao criar importação: ${error.message}`, 500)
    }
  }
}

export default new ImportPhoneController()
