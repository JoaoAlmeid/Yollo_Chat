import { Request, Response } from "express"
import { getIO } from "../../libs/socket"
import AppError from "../../errors/AppError"
import prisma from "../../prisma/client"

import CreateService from "src/services/file/Create"
import ListService from "src/services/file/List"
import UpdateService from "src/services/file/Update"
import ShowFileService from "src/services/file/Show"
import DeleteService from "src/services/file/Delete"
import SimpleListService from "src/services/file/SimpleList"
import DeleteAllService from "src/services/file/DeleteAll"
import { head } from "lodash"

type IndexQuery = {
  searchParam?: string
  pageNumber?: string | number
}

class FilesController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { pageNumber, searchParam } = req.query as IndexQuery
      const { companyId } = req.user!
  
      const { files, count, hasMore } = await ListService({
        searchParam,
        pageNumber,
        companyId
      })
  
      return res.json({ files, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar arquivos" })
      throw new AppError(`Ocorreu um erro ao recuperar arquivos: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { name, message, options } = req.body
      const { companyId } = req.user!
  
      const fileList = await CreateService({
        name,
        message,
        options,
        companyId
      })
  
      this.emitFileEvent(companyId, "create", fileList)
  
      return res.status(201).json(fileList)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar arquivo" })
      throw new AppError(`Ocorreu um erro ao criar arquivo: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { fileId } = req.params
      const { companyId } = req.user!
  
      const file = await ShowFileService(fileId, companyId)
  
      return res.status(200).json(file)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir arquivo" })
      throw new AppError(`Ocorreu um erro ao exibir arquivo: ${error.message}`, 500)
    }
  }

  public async uploadMedias(req: Request, res: Response): Promise<Response> {
    const { fileId, id, mediaType } = req.body
    const files = req.files as Express.Multer.File[]
    const file = head(files)

    try {
      if (files.length > 0) {
        for (const [index, file] of files.entries()) {
          const fileOpt = await prisma.filesOptions.findUnique({
            where: {
              fileId,
              id: Array.isArray(id) ? id[index] : id
            }
          })

          if (fileOpt) {
            await prisma.filesOptions.update({
              where: {
                id: fileOpt.id
              },
              data: {
                path: file.filename.replace('/', '-'),
                mediaType: Array.isArray(mediaType) ? mediaType[index] : mediaType
              }
            })
          }
        }
      }
  
      return res.send({ message: "Arquivos atualizados" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar arquivos" })
      throw new AppError(`Ocorreu um erro ao atualizar arquivos: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    if (req.user?.profile !== "admin") {
      throw new AppError("ERR_NO_PERMISSION", 403)
    }
    
    try {
      const { fileId } = req.params
      const fileData = req.body
      const { companyId } = req.user!
  
      const fileList = await UpdateService({ fileData, id: fileId, companyId })
      this.emitFileEvent(companyId, "update", fileList)
  
      return res.status(200).json(fileList)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar arquivo" })
      throw new AppError(`Ocorreu um erro ao atualizar arquivo: ${error.message}`, 500)
    }
  }
    
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { fileId } = req.params
      const { companyId } = req.user!
  
      await DeleteService(fileId, companyId)
  
      this.emitFileEvent(companyId, "delete", { fileId })
  
      return res.status(200).json({ message: "Arquivo deletado com sucesso" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar arquivo" })
      throw new AppError(`Ocorreu um erro ao deletar arquivo: ${error.message}`, 500)
    }
  }

  public async removeAll(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user!
      await DeleteAllService(companyId)
  
      return res.status(200).json({ 
        message: "Todos os arquivos foram deletados com sucesso" 
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar todos arquivos" })
      throw new AppError(`Ocorreu um erro ao deletar todos arquivos: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam } = req.query as IndexQuery
      const { companyId } = req.user!
  
      const ratings = await SimpleListService({ searchParam, companyId })
  
      return res.json(ratings)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar arquivos" })
      throw new AppError(`Ocorreu um erro ao listar arquivos: ${error.message}`, 500)
    }
  }

  private emitFileEvent(companyId: string | number, action: string, data: any) {
    const io = getIO()
    io.emit(`company${companyId}-file`, {
      action,
      ...data
    })
  }
}

export default new FilesController()