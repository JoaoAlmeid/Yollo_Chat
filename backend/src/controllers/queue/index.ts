import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'
import { isNil } from 'lodash'

// Services
import CreateQueue from '../../services/queue/CreateQueue'
import DeleteQueue from '../../services/queue/DeleteQueue'
import ListQueues from '../../services/queue/ListQueue'
import ShowQueue from '../../services/queue/ShowQueue'
import UpdateQueue from '../../services/queue/UpdateQueue'

class QueueController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId: userCompanyId } = req.user
      const { companyId: queryCompanyId } = req.query
      let companyId = userCompanyId
  
      if (!isNil(queryCompanyId)) {
        companyId = +queryCompanyId
      }
  
      const queues = await ListQueues({ companyId: Number(companyId) })
      return res.status(200).json(queues)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar filas" })
      throw new AppError(`Ocorreu um erro ao recuperar filas: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { name, color, greetingMessage, outOfHoursMessage, schedules, orderQueue, integrationId, promptId } = req.body
      const { companyId } = req.user
  
      const queue = await CreateQueue({
        name,
        color,
        greetingMessage,
        companyId,
        outOfHoursMessage,
        schedules,
        orderQueue: orderQueue === "" ? null : orderQueue,
        integrationId: integrationId === "" ? null : integrationId,
        promptId: promptId === "" ? null : promptId
      })
  
      const io = getIO()
      io.emit(`company-${companyId}-queue`, {
        action: "update",
        queue
      })
      return res.status(200).json(queue)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar filas" })
      throw new AppError(`Ocorreu um erro ao criar filas: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { queueId } = req.params
      const { companyId } = req.user
  
      const queue = await ShowQueue(queueId, companyId)
      return res.status(200).json(queue)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir fila" })
      throw new AppError(`Ocorreu um erro ao exibir fila: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { queueId } = req.params
      const { companyId } = req.user
      const { 
        name, 
        color, 
        greetingMessage, 
        outOfHoursMessage, 
        schedules, 
        orderQueue, 
        integrationId, 
        promptId } = req.body
      
      const queue = await UpdateQueue(queueId, {
        name,
        color,
        greetingMessage,
        outOfHoursMessage,
        schedules,
        companyId,
        orderQueue: orderQueue === "" ? null : orderQueue,
        integrationId: integrationId === "" ? null : integrationId,
        promptId: promptId === "" ? null : promptId
      }, companyId)

      const io = getIO()
      io.emit(`company-${companyId}-queue`, {
        action: "update",
        queue
      })
  
      return res.status(200).json(queue)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar fila" })
      throw new AppError(`Ocorreu um erro ao atualizar fila: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { queueId } = req.params
      const { companyId } = req.user

      await DeleteQueue(queueId, companyId)

      const io = getIO()
      io.emit(`company-${companyId}-queue`, {
        action: "delete",
        queueId: +queueId
      })

      return res.status(200).json({ mensagem: "Fila deletada com sucesso" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar fila" })
      throw new AppError(`Ocorreu um erro ao deletar fila: ${error.message}`, 500)
    }
  }
}

export default new QueueController()
