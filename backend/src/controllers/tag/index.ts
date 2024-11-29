import { Request, Response, NextFunction } from 'express'
import CreateTag from '../../services/tag/CreateTag'
import DeleteTag from '../../services/tag/DeleteTag'
import KanbanList from '../../services/tag/KanbanList'
import ListTags from '../../services/tag/ListTags'
import ShowTag from '../../services/tag/ShowTag'
import SimpleList from '../../services/tag/SimpleList'
import UpdateTag from '../../services/tag/UpdateTag'
import SyncTags from '../../services/tag/SyncTags'
import { IndexQuery } from './types'
import { getIO } from 'src/libs/socket'
import AppError from 'src/errors/AppError'

class TagController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
      const { companyId } = req.user

      const { tags, count, hasMore } = await ListTags({
        companyId,
        searchParam,
        pageNumber: Number(pageNumber) || 1,
      })

      return res.status(200).json({ tags, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar tags" })
      throw new AppError(`Ocorreu um erro ao recuperar tags: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { name, color, kanban } = req.body
      const { companyId } = req.user

      const tag = await CreateTag({ name, color, kanban, companyId })

      const io = getIO()
      io.emit("tag", {
        action: "create",
        tag
      })

      return res.status(200).json(tag)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar tag" })
      throw new AppError(`Ocorreu um erro ao criar tag: ${error.message}`, 500)
    }
  }

  public async kanban(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user

      const tags = await KanbanList(companyId)

      return res.status(200).json({ lista: tags })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar tags kanban" })
      throw new AppError(`Ocorreu um erro ao listar tags kanban: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { tagId } = req.params

      const tag = await ShowTag(tagId)

      return res.status(200).json(tag)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir tag" })
      throw new AppError(`Ocorreu um erro ao exibir tag: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    if (req.user.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403)
    }

    try {
      const { tagId } = req.params
      const tagData = req.body

      const updatedTag = await UpdateTag({ tagData, id: tagId })

      const io = getIO()
      io.emit("tag", {
        action: "update",
        updatedTag
      })

      return res.status(200).json(updatedTag)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar tag" })
      throw new AppError(`Ocorreu um erro ao atualizar tag: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { tagId } = req.params

      await DeleteTag(tagId)

      return res.status(200).json({
        message: "Tag deletada"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar tag" })
      throw new AppError(`Ocorreu um erro ao deletar tag: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam } = req.query as IndexQuery
      const { companyId } = req.user

      const tags = await SimpleList({ companyId, searchParam })

      return res.status(200).json(tags)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar tags" })
      throw new AppError(`Ocorreu um erro ao listar tags: ${error.message}`, 500)
    }
  }

  public async syncTags(req: Request, res: Response): Promise<Response> {
    try {
      const { data } = req.body
      const { companyId } = req.user

      const updatedTicket = await SyncTags({ ...data, companyId })
      
      return res.status(200).json(updatedTicket)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro com as SyncTags" })
      throw new AppError(`Ocorreu um erro com as SyncTags: ${error.message}`, 500)
    }
  }
}

export default new TagController()