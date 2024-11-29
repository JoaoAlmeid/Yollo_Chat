import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'

import CreateContact from 'src/services/contact/Create'
import DeleteContact from 'src/services/contact/Delete'
import GetContact from 'src/services/contact/Get'
import ListContacts from 'src/services/contact/List'
import ShowContact from 'src/services/contact/Show'
import SimpleContactList from 'src/services/contact/SimpleList'
import UpdateContactService from 'src/services/contact/Update'
import CheckIsValidContact from 'src/services/wbot/CheckIsValidContact'
import CheckContactNumber from 'src/services/wbot/CheckNumber'
import GetProfilePicUrl from 'src/services/wbot/GetProfilePicUrl'
import { ContactData, IndexGetContactQuery, IndexQuery } from './types'
import { SearchContactParams } from 'src/@types/Contact'

const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Formato de número inválido")
})

class ContactController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
      const { companyId } = req.user

      const { contacts, count, hasMore } = await ListContacts({
        searchParam,
        pageNumber,
        companyId
      })
  
      return res.json({ contacts, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao carregar contatos" })
      throw new AppError(`Ocorreu um erro ao carregar contatos: ${error.message}`, 500)
    }

  }

  public async getContact(req: Request, res: Response): Promise<Response> {
    try {
      const { name, number } = req.body as IndexGetContactQuery
      const { companyId } = req.user
      
      if (!name || !number) {
        return res.status(400).json({ error: 'Nome e número são obrigatórios' })
      }

      const contact = await GetContact({ 
        name, 
        number, 
        companyId 
      })

      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado' })
      }
      return res.status(200).json(contact)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao carregar contato" })
      throw new AppError(`Ocorreu um erro ao carregar contato: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const newContact: ContactData = req.body
      newContact.number = newContact.number.replace("-", "").replace(" ", "")
  
      try {
        await schema.validate(newContact)
      } catch (error: any) {
        throw new AppError(error.message)
      }
      
      await CheckIsValidContact(newContact.number, companyId)
      const validNumber = await CheckContactNumber(newContact.number, companyId)
      const number = validNumber.jid.replace(/\D/g, "")
      newContact.number = number
      
      // Url da foto de perfil
      const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId)

      // Cria o contato
      const contact = await CreateContact({
        ...newContact,
        profilePicUrl,
        companyId
      })

      const io = getIO()
      io.emit(`company-${companyId}-contact`, {
        action: "create",
        contact
      })

      return res.status(200).json(contact)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar contato" })
      throw new AppError(`Ocorreu um erro ao criar contato: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { contactId } = req.params
      const { companyId } = req.user

      const contact = await ShowContact(contactId, companyId)
      return res.status(200).json(contact)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir contato" })
      throw new AppError(`Ocorreu um erro ao exibir contato: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const contactData: ContactData = req.body
      const { companyId } = req.user
  
      try {
        await schema.validate(contactData)
      } catch (error: any) {
        throw new AppError(error.message)
      }
      
      await CheckIsValidContact(contactData.number, companyId)
      const validNumber = await CheckContactNumber(contactData.number, companyId)
      const number = validNumber.jid.replace(/\D/g, "")
      contactData.number = number
      
      const { contactId } = req.params
  
      const contact = await UpdateContactService({
        contactData,
        contactId,
        companyId,
      })
  
      const io = getIO()
      io.emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      })
      return res.status(200).json(contact)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar contato" })
      throw new AppError(`Ocorreu um erro ao atualizar contato: ${error.message}`, 500)
    }
    
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { contactId } = req.params
      const { companyId } = req.user

      await ShowContact(contactId, companyId)
      await DeleteContact(contactId)

      return res.status(200).json({
        message: "Contato deletado"
      })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar contato" })
      throw new AppError(`Ocorreu um erro ao deletar contato: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.query as SearchContactParams
      const { companyId } = req.user

      const contacts = await SimpleContactList({
        name: String(name),
        companyId: Number(companyId),
      })

      return res.status(200).json(contacts)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar contatos" })
      throw new AppError(`Ocorreu um erro ao listar contatos: ${error.message}`, 500)
    }
  }

}

export default new ContactController()
