import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'

import ListContactItem from '../../services/contactListItem/List'
import CreateContactListItem from '../../services/contactListItem/Create'
import ShowContactListItem from '../../services/contactListItem/Show'
import UpdateContactList from '../../services/contactListItem/Update'
import DeleteContactListItem from '../../services/contactListItem/Delete'
import FindContactItem from '../../services/contactListItem/Find'
import { IndexQuery, StoreData } from './types'

const schema = Yup.object().shape({
  name: Yup.string().required()
})

class ContactListItemController {
  public async index(req: Request, res: Response): Promise<Response> {
    const { searchParam, pageNumber, contactListId } = req.body as IndexQuery
    const { companyId } = req.user

    try {
      const { contacts, count, hasMore } = await ListContactItem({
        searchParam,
        pageNumber,
        companyId,
        contactListId
      })

      return res.json({ contacts, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar items da lista de contatos" })
      throw new AppError(`Ocorreu um erro ao recuperar items da lista de contatos: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body as StoreData
      
      try { await schema.validate(data) } 
      catch (error: any) { throw new AppError(error.message) }

      const contactListItem = await CreateContactListItem({ ...data, companyId })
  
      const io = getIO()
      io.emit(`company-${companyId}-ContactListItem`, {
        action: "create",
        contactListItem
      })
  
      return res.status(201).json(contactListItem)
      
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar item da lista de contatos" })
      throw new AppError(`Ocorreu um erro ao criar item da lista de contatos: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const contactListItem = await ShowContactListItem(id)
      return res.json(contactListItem)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir items da lista de contatos" })
      throw new AppError(`Ocorreu um erro ao exibir items da lista de contatos: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData
      const { companyId } = req.user
      
      try { await schema.validate(data) } 
      catch (error: any) { throw new AppError(error.message) }
      
      const { id } = req.params
      
      const contactListItem = await UpdateContactList({
        ...data,
        id
      })

      const io = getIO()
      io.emit(`company-${companyId}-ContactListItem`, {
        action: "update",
        contactListItem
      });

      return res.json(contactListItem)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar items da lista de contatos" })
      throw new AppError(`Ocorreu um erro ao atualizar items da lista de contatos: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user
  
      if (isNaN(Number(id))) {
        throw new AppError('ID inválido para deletar item da lista de contato', 400)
      }
      
      await DeleteContactListItem(Number(id))

      const io = getIO()
      io.emit(`company-${companyId}-ContactListItem`, {
        action: "delete",
        id
      })

      return res.status(200).json({ message: "Item de contato deletado com sucesso" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar items da lista de contatos" })
      throw new AppError(`Ocorreu um erro ao deletar items da lista de contatos: ${error.message}`, 500)
    }
  }
  
  public async find(req: Request, res: Response): Promise<Response> {
   try {
     const { companyId, contactListId } = req.query
 
     if (!companyId) { 
       throw new AppError("O Id da empresa é obrigatório", 400) 
     }
 
     const contactListItems = await FindContactItem({
       companyId: Number(companyId),
       contactListId: contactListId ? Number(contactListId) : undefined,
     })
 
     return res.status(200).json(contactListItems)
   } catch (error: any) {
     console.error(error.message)
       res.status(500).json({ error: "Ocorreu um erro ao buscar items da lista de contatos" })
       throw new AppError(`Ocorreu um erro ao buscar items da lista de contatos: ${error.message}`, 500)
   }
  }
}

export default new ContactListItemController()