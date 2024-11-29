import { getIO } from 'src/libs/socket'
import AppError from '../../errors/AppError'
import CreateWhatsApp from '../../services/whatsapp/CreateWhatsApp'
import DeleteWhatsApp from '../../services/whatsapp/DeleteWhatsApp'
import ListWhatsApps from '../../services/whatsapp/ListWhatsApps'
import ShowWhatsApp from '../../services/whatsapp/ShowWhatsApp'
import UpdateWhatsApp from '../../services/whatsapp/UpdateWhatsApp'
import { Request, Response } from 'express'
import { QueryParams, WhatsappData } from './types'
import { StartWhatsAppSession } from 'src/services/wbot/StartWhatsAppSession'
import { removeWbot } from 'src/libs/wbot'

class WhatsAppController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const { session } = req.query as QueryParams
      const whatsapps = await ListWhatsApps({ companyId, session })

      return res.status(200).json(whatsapps)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar whatsapp" })
      throw new AppError(`Ocorreu um erro ao recuperar whatsapp: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        status,
        isDefault,
        greetingMessage,
        complationMessage,
        outOfHoursMessage,
        queueIds,
        token,
        //timeSendQueue,
        //sendIdQueue,
        transferQueueId,
        timeToTransfer,
        promptId,
        maxUseBotQueues,
        timeUseBotQueues,
        expiresTicket,
        expiresInactiveMessage
      }: WhatsappData = req.body
      const { companyId } = req.user

      const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsApp({
        name,
        status,
        isDefault,
        greetingMessage,
        complationMessage,
        outOfHoursMessage,
        queueIds,
        companyId,
        token,
        transferQueueId,
        timeToTransfer,	
        promptId,
        maxUseBotQueues,
        timeUseBotQueues,
        expiresTicket,
        expiresInactiveMessage
      })

      StartWhatsAppSession(whatsapp, companyId)

      const io = getIO()
      io.emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      })

      if (oldDefaultWhatsapp) {
        io.emit(`company-${companyId}-whatsapp`, {
          action: "update",
          whatsapp: oldDefaultWhatsapp
        })
      }

      return res.status(200).json(whatsapp)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao criar sessão whatsapp: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { whatsappId } = req.params
      const { companyId } = req.user
      const { session } = req.query

      const response = await ShowWhatsApp(whatsappId, companyId, session)

      return res.status(200).json(response)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao exibir sessão whatsapp: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { whatsappId } = req.params
      const whatsappData = req.body
      const { companyId } = req.user

      const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsApp({
        whatsappData,
        whatsappId: Number(whatsappId),
        companyId,
      })

      const io = getIO()
      io.emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      })

      if (oldDefaultWhatsapp) {
        io.emit(`company-${companyId}-whatsapp`, {
          action: "update",
          whatsapp: oldDefaultWhatsapp
        })
      }

      return res.status(200).json(whatsapp)
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

      await ShowWhatsApp(whatsappId, companyId)

      await DeleteWhatsApp(Number(whatsappId))
      removeWbot(+whatsappId)

      const io = getIO()
      io.emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: +whatsappId
      })

      return res.status(200).json({ message: "Whatsapp deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar sessão whatsapp" })
      throw new AppError(`Ocorreu um erro ao deletar sessão whatsapp: ${error.message}`, 500)
    }
  }
}

export default new WhatsAppController()
