import { Request, Response } from 'express'
import { getWbot } from '../../libs/wbot'
import ShowWhatsApp from '../../services/whatsapp/ShowWhatsApp'
import { StartWhatsAppSession } from 'src/services/wbot/StartWhatsAppSession'
import UpdateWhatsApp from '../../services/whatsapp/UpdateWhatsApp'
import AppError from '../../errors/AppError'

class WhatsAppSessionController {
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { whatsappId } = req.params
      const companyId = req.user

      if (typeof companyId !== 'string') {
        throw new AppError('companyId deve ser uma string', 400)
      }

      const companyIdNumber = Number(companyId)
      if (isNaN(companyIdNumber)) {
        throw new AppError('companyId deve ser um número válido', 400)
      }

      const whatsapp = await ShowWhatsApp(whatsappId, companyId)

      if (!whatsapp) {
        throw new AppError('WhatsApp não encontrado', 404)
      }

      await StartWhatsAppSession(whatsapp, companyId)

      return res.status(200).json({ message: 'Iniciando sessão.' })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao criar sessão whatsapp: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { whatsappId } = req.params
      const { companyId } = req.user

      const { whatsapp } = await UpdateWhatsApp({
        whatsappId: Number(whatsappId),
        companyId,
        whatsappData: { session: '' },
      })

      if (!whatsapp) {
        throw new AppError('WhatsApp não encontrado', 404)
      }

      await StartWhatsAppSession(whatsapp, companyId)

      return res.status(200).json({ message: 'Sessão atualizada e iniciada.' })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao atualizar sessão whatsapp: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { whatsappId } = req.params
      const { companyId } = req.user

      // Certifique-se de que companyId é uma string e depois converta para número
      if (typeof companyId !== 'string') {
        throw new AppError('companyId deve ser uma string', 400)
      }

      const companyIdNumber = Number(companyId)
      if (isNaN(companyIdNumber)) {
        throw new AppError('companyId deve ser um número válido', 400)
      }

      const whatsapp = await ShowWhatsApp(Number(whatsappId), companyIdNumber)
      if (!whatsapp) {
        throw new AppError('WhatsApp não encontrado', 404)
      }

      if (whatsapp.session) {
        await UpdateWhatsApp({
          whatsappId: Number(whatsappId),
          companyId: companyIdNumber,
          whatsappData: { status: 'DISCONNECTED', session: '' },
        })

        const wbot = getWbot(whatsapp.id)
        if (wbot) {
          await wbot.logout()
        } else {
          throw new AppError('Bot não encontrado', 404)
        }
      }

      return res.status(200).json({ message: 'Sessão desconectada.' })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao deletar sessão whatsapp: ${error.message}`, 500)
    }
  }
}

export default new WhatsAppSessionController()
