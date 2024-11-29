import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import CreateQOptionService from 'src/services/queue/option/CreateService'
import DeleteQOptionService from 'src/services/queue/option/DeleteService'
import ListQOptionService from 'src/services/queue/option/ListService'
import ShowQOptionService from 'src/services/queue/option/ShowService'
import UpdateQOptionService from 'src/services/queue/option/UpdateService'

type FilterList = {
  queueId: string | number
  queueOptionId: string | number
  parentId: string | number | boolean
}

class QueueOptionController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { queueId, queueOptionId, parentId } = req.query as FilterList

      const queueOptions = await ListQOptionService({
        queueId,
        queueOptionId,
        parentId
      })

      return res.status(200).json(queueOptions)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar opções da fila" })
      throw new AppError(`Ocorreu um erro ao recuperar opções da fila: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const queueOptionData = req.body
      const queueOption = await CreateQOptionService(queueOptionData)
      return res.status(200).json(queueOption)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar opção da fila" })
      throw new AppError(`Ocorreu um erro ao criar opção da fila: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { queueOptionId } = req.params
      const queueOption = await ShowQOptionService(queueOptionId)
      return res.status(200).json(queueOption)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir opção da fila" })
      throw new AppError(`Ocorreu um erro ao exibir opção da fila: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { queueOptionId } = req.params
      const queueOptionData = req.body
      const updatedQueueOption = await UpdateQOptionService(queueOptionId, queueOptionData )
      return res.status(200).json(updatedQueueOption)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar da fila" })
      throw new AppError(`Ocorreu um erro ao atualizar da fila: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { queueOptionId } = req.params
      await DeleteQOptionService(Number(queueOptionId))
      return res.status(200).json({
        message: "Opção de fila deletada"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar opção da fila" })
      throw new AppError(`Ocorreu um erro ao deletar opção da fila: ${error.message}`, 500)
    }
  }
}

export default new QueueOptionController()