import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'
import { Help } from '@prisma/client'

import CreateHelp from '../../services/help/CreateHelp'
import DeleteHelp from '../../services/help/DeleteHelp'
import FindHelp from '../../services/help/FindHelp'
import ListHelp from '../../services/help/ListHelp'
import ShowHelp from '../../services/help/ShowHelp'
import UpdateHelp from '../../services/help/UpdateHelp'
import { IndexQuery, StoreData } from './types'

const schema = Yup.object().shape({
  title: Yup.string().required('Titulo é obrigatório'),
  description: Yup.string().required('Descrição é obrigatória'),
  video: Yup.string().url('Formato da url inválido'),
  link: Yup.string().url('Formato da url inválido'),
})

class HelpController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery

      const { records, count, hasMore } = await ListHelp({
        searchParam,
        pageNumber
      })

      return res.json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar ajudas" })
      throw new AppError(`Ocorreu um erro ao recuperar ajudas: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body as StoreData
      try {
        await schema.validate(data, { abortEarly: false })
      } catch (error: any) {
        throw new AppError(error.message.join(', '), 400)
      }

      const help = await CreateHelp({ ...data })

      const io = getIO()
      io.emit(`company-${companyId}-help`, {
        action: "create",
        help
      })

      return res.status(200).json(help)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar ajuda" })
      throw new AppError(`Ocorreu um erro ao criar ajuda: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const help = await ShowHelp(Number(id))

      if (!help) {
        throw new AppError('Help não encontrado', 404)
      }

      return res.status(200).json(help)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir ajuda" })
      throw new AppError(`Ocorreu um erro ao exibir ajuda: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData
      const { companyId } = req.user!
      const { id } = req.params
  
      try {
        await schema.validate(data, { abortEarly: false })
      } catch (error: any) {
        throw new AppError(error.message.join(', '), 400)
      }
  
      const help = await UpdateHelp({ ...data, id })
  
      const io = getIO()
      io.emit(`company-${companyId}-help`, {
        action: "update",
        help
      })
      
      return res.status(200).json(help)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar ajuda" })
      throw new AppError(`Ocorreu um erro ao atualizar ajuda: ${error.message}`, 500)
    }
    
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user
  
      await DeleteHelp(Number(id))
  
      const io = getIO()
      io.emit(`company-${companyId}-help`, {
        action: "delete",
        id
      })
      return res.status(204).json({ message: "Ajuda deletada com sucesso" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar ajuda" })
      throw new AppError(`Ocorreu um erro ao deletar ajuda: ${error.message}`, 500)
    }
  }

  public async findList(req: Request, res: Response): Promise<Response> {
    try {
      const helps: Help[] = await FindHelp()
      return res.json(helps)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar ajudas" })
      throw new AppError(`Ocorreu um erro ao listar ajudas: ${error.message}`, 500)
    }
  }
}

export default new HelpController()