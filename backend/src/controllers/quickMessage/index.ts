import { Request, Response } from 'express'
import * as Yup from 'yup'
import { FindParams, IndexQuery, StoreData } from './types'
import AppError from '../../errors/AppError'
import { getIO } from 'src/libs/socket'

import CreateQMessage from 'src/services/quickMessage/CreateQuickMessage'
import DeleteQMesssage from 'src/services/quickMessage/DeleteQuickMessage'
import FindQuickMessage from 'src/services/quickMessage/FindQuickMessage'
import ListQMessage from 'src/services/quickMessage/ListQuickMessage'
import ShowQMessage from 'src/services/quickMessage/ShowQuickMessage'
import UpdateQuickMessage from 'src/services/quickMessage/UpdateQuickMessage'
import { head } from 'lodash'
import prisma from '../../prisma/client'
import path from 'path'
import fs from 'fs'

const schema = Yup.object().shape({
  shortcode: Yup.string().required('Shortcode é obrigatório'),
  message: Yup.string().required('Mensagem é obrigatória')
})

class QuickMessageController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber, userId } = req.query as IndexQuery
      const { companyId } = req.user

      const { records, count, hasMore } = await ListQMessage({
        searchParam,
        pageNumber,
        companyId,
        userId,
      })
      
      return res.status(200).json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar mensagens rápidas" })
      throw new AppError(`Ocorreu um erro ao recuperar mensagens rápidas: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body as StoreData

      try {
        await schema.validate(data)
      } catch (error: any) {
        throw new AppError(error.message)
      }
      
      const quickMessage = await CreateQMessage({
        ...data,
        companyId,
        userId: req.user.id
      })

      const io = getIO()
      io.emit(`company-${companyId}-quickMessage`, {
        action: "create",
        quickMessage
      })

      return res.status(200).json(quickMessage)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar mensagem rápida" })
      throw new AppError(`Ocorreu um erro ao criar mensagem rápida: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const quickMessage = await ShowQMessage(id)
      return res.status(200).json(quickMessage)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir mensagem rápida" })
      throw new AppError(`Ocorreu um erro ao exibir mensagem rápida: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData
      const { companyId } = req.user

      try {
        await schema.validate(data)
      } catch (error: any) {
        throw new AppError(error.message)
      }

      const { id } = req.params

      const quickMessage = await UpdateQuickMessage({
        ...data,
        userId: req.user.id,
        id: Number(id),
        companyId
      })

      const io = getIO()
      io.emit(`company-${companyId}-quickmessage`, {
        action: "update",
        quickMessage
      })

      return res.status(200).json(quickMessage)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar mensagem rápida" })
      throw new AppError(`Ocorreu um erro ao atualizar mensagem rápida: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user
      
      await DeleteQMesssage(Number(id))

      const io = getIO()
      io.emit(`company-${companyId}-quickmessage`, {
        action: "delete",
        id
      })

      return res.status(200).json({
        message: "Mensagem deletada"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar mensagem rápida" })
      throw new AppError(`Ocorreu um erro ao deletar mensagem rápida: ${error.message}`, 500)
    }
  }

  public async findList(req: Request, res: Response): Promise<Response> {
    try {
      const params = req.query as FindParams
      const quickMessages = await FindQuickMessage(params)

      return res.status(200).json(quickMessages)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao buscar por mensagem rápida" })
      throw new AppError(`Ocorreu um erro ao buscar por mensagem rápida: ${error.message}`, 500)
    }
  }

  public async mediaUpload(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const files = req.files as Express.Multer.File[]
      const file = head(files)

      const quickMessage = await prisma.quickMessage.update({
        where: { id: req.user.id },
        data: {
          mediaPath: file.filename,
          mediaName: file.originalname
        }
      })

      return res.status(200).json({ 
        mensagem: "Arquivo Anexado",
        quickMessage
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao anexar arquivo" })
      throw new AppError(`Ocorreu um erro ao anexar arquivo: ${error.message}`, 500)
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user

      const quickmessage = await prisma.quickMessage.findUnique({
        where: { id: Number(id) }
      })

      const filePath = path.resolve("public", "quickMessage", quickmessage.mediaName)
      const fileExists = fs.existsSync(filePath)

      if (fileExists) {
        fs.unlinkSync(filePath)
      }

      await prisma.quickMessage.update({
        where: { id: Number(id) },
        data: {
          mediaPath: null,
          mediaName: null
        }
      })

      return res.status(200).json({ 
        mensagem: "Arquivo deletado" 
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar arquivo" })
      throw new AppError(`Ocorreu um erro ao deletar arquivo: ${error.message}`, 500)
    }
  }
}

export default new QuickMessageController()