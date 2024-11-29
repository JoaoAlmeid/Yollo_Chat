import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from '../../errors/AppError'
import { Announcement } from '@prisma/client'
import prisma from '../../prisma/client'
import { getIO } from 'src/libs/socket'
import { head } from 'lodash'
import path from 'path'
import fs from 'fs'

import CreateService from '../../services/announcement/Create'
import DeleteService from '../../services/announcement/Delete'
import ListService from '../../services/announcement/List'
import ShowService from '../../services/announcement/Show'
import UpdateService from '../../services/announcement/Update'
import FindService from '../../services/announcement/Find'
import { FindParams, IndexQuery, StoreData } from './types'

const schema = Yup.object().shape({ title: Yup.string().required() })

class AnnouncementsController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery

      const { records, count, hasMore } = await ListService({
        searchParam,
        pageNumber
      })

      return res.status(200).json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar anúncios" })
      throw new AppError(`Ocorreu um erro ao recuperar anúncios: ${error.message}`, 500)
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

      const announcement = await CreateService({
        ...data,
        companyId
      })

      const io = getIO()
      io.emit(`company-announcement`, {
        action: "create",
        companyId
      })
      return res.status(200).json(announcement)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar anúncio" })
      throw new AppError(`Ocorreu um erro ao criar anúncio: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const announcement = await ShowService(id)
      return res.status(200).json(announcement)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir anúncios" })
      throw new AppError(`Ocorreu um erro ao exibir anúncios: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData

      try {
        await schema.validate(data)
      } catch (error: any) {
        throw new AppError(error.message)
      }
      
      const { id } = req.params

      const announcement = await UpdateService({
        ...data,
        id
      })

      const io = getIO()
      io.emit(`company-announcement`, {
        action: "update",
        announcement
      })

      return res.status(200).json(announcement)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir anúncios" })
      throw new AppError(`Ocorreu um erro ao exibir anúncios: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user
      
      await DeleteService(id)

      const io = getIO()
      io.emit(`company-${companyId}-announcement`, {
        action: "delete",
        id
      })

      return res.status(200).json({ message: "Anúncio deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar anúncio" })
      throw new AppError(`Ocorreu um erro ao deletar anúncio: ${error.message}`, 500)
    }
  }

  public async findList(req: Request, res: Response): Promise<Response> {
    try {
      const params = req.query as FindParams

      const announcements: Announcement[] = await FindService(params)

      return res.status(200).json(announcements)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar anúncios" })
      throw new AppError(`Ocorreu um erro ao listar anúncios: ${error.message}`, 500)
    }
  }

  public async mediaUpload(req: Request, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      // Busca o anúncio e se não encontrado, lança o erro
      const announcement = await prisma.announcement.findUnique({ where: { id: Number(id) } })
      if (!announcement) { return res.status(404).json({ message: "Anúncio não encontrado" })}

      const files = req.files as Express.Multer.File[]
      const file = head(files)

      await prisma.announcement.update({
        where: { id: +id },
        data: {
          mediaPath: file.filename,
          mediaName: file.originalname
        }
      })

      const io = getIO()
      io.emit(`company-announcemnet`, {
        action: "update",
        announcement
      })

      return res.status(200).json(announcement).send({ mesnsagem: "Mensagem enviada" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao enviar arquivo" })
      throw new AppError(`Ocorreu um erro ao enviar arquivo: ${error.message}`, 500)
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    try {
      // Busca o anúncio e se não encontrado, lança o erro
      const announcement = await prisma.announcement.findUnique({ where: { id: Number(id) } })
      if (!announcement) { return res.status(404).json({ message: "Anúncio não encontrado" })}

      // Busca o arquivo e verifica se existe
      const filePath = path.resolve("public", announcement.mediaPath)
      const fileExists = fs.existsSync(filePath)
      if (fileExists) { fs.unlinkSync(filePath) }

      // Atualiza o anúncio
      await prisma.announcement.update({
        where: { id: Number(id) },
        data: {
          mediaName: null,
          mediaPath: null
        }
      })

      const io = getIO()
      io.emit(`company-announcement`, { action: "update", record: announcement })

      return res.send({ messagem: "Arquivo excluido com sucesso" })
    } catch (error: any) {
      throw new AppError(error.message)
    }
  }
}

export default new AnnouncementsController()
