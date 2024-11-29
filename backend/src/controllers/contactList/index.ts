import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from '../../errors/AppError'
import { getIO } from 'src/libs/socket'
import { head } from 'lodash'

import ListContactList from '../../services/contactList/List'
import CreateContactList from '../../services/contactList/Create'
import ShowContactList from '../../services/contactList/Show'
import UpdateContactList from '../../services/contactList/Update'
import DeleteContactList from '../../services/contactList/Delete'
import FindContactList from '../../services/contactList/Find'
import { ImportContactList } from '../../services/contactList/ImportContactList'
import { IndexQuery, StoreData } from './types'
import { ContactList } from '@prisma/client'

const schema = Yup.object().shape({ name: Yup.string().required()})

class ContactListController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
      const { companyId } = req.user
  
      const { records, count, hasMore } = await ListContactList({
        searchParam,
        pageNumber,
        companyId
      })
  
      return res.status(200).json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao carregar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao carregar lista de contatos: ${error.message}`, 500)
    }
  }
  
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body as StoreData
    
      try { await schema.validate(data)} 
      catch (error: any) { throw new AppError(error.message)}

      const contactList = await CreateContactList({
        ...data,
        companyId
      })

      const io = getIO()
      io.emit(`company-${companyId}-ContactList`, {
        action: "create",
        contactList
      })

      return res.status(200).json(contactList)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao criar lista de contatos: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const contactList = await ShowContactList(id)
      return res.status(200).json(contactList)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir lista de contatos" })
      throw new AppError(`Ocorreu um erro ao exibir lista de contatos: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData
      const { companyId } = req.user
  
      try { await schema.validate(data)} 
      catch (error: any) { throw new AppError(error.message)}
      
      const { id } = req.params

      const contactList = await UpdateContactList({ 
        ...data,
        id: Number(id)
      })

      const io = getIO()
      io.emit(`company-${companyId}-ContactList`, {
        action: "update",
        contactList
      })
      return res.status(200).json(contactList)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao atualizar lista de contatos: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user
      
      await DeleteContactList(Number(id))

      const io = getIO()
      io.emit(`company-${companyId}-ContactList`, {
        action: "delete",
        id
      })

      return res.status(200).json({
        message: "Lista de contatos deletada"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao deletar lista de contatos: ${error.message}`, 500)
    }
  }

  public async find(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params
      const contactLists: ContactList[] = await FindContactList({ companyId })
      return res.status(200).json(contactLists)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao recuperar lista de contatos: ${error.message}`, 500)
    }
  }

  public async upload(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.files as Express.Multer.File[]
      const file: Express.Multer.File = head(files) as Express.Multer.File
      const { id } = req.params
      const {companyId } = req.user
      
      const contactListItems = await ImportContactList(+id, companyId, file)

      const io = getIO()
      io.emit(`company-${companyId}-contactListItem-${+id}`, {
        action: "reload",
        records: contactListItems
      })
      return res.json(contactListItems)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao importar lista de contatos" })
      throw new AppError(`Ocorreu um erro ao importar lista de contatos: ${error.message}`, 500)
    }
  }
}

export default new ContactListController()
