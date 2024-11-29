import * as Yup from 'yup'
import { Request, Response } from 'express'
import { Campaign, Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from 'src/errors/AppError'
import { getIO } from 'src/libs/socket'
import { head } from 'lodash'
import path from 'path'
import fs from 'fs'

import { cancelService } from '../../services/campaing/Cancel'
import deleteCampaign from '../../services/campaing/Delete'
import findCampaigns from '../../services/campaing/Find'
import listCampaigns from '../../services/campaing/List'
import { restartCampaign } from '../../services/campaing/Restart'
import showCampaign from '../../services/campaing/Show'
import updateCampaignService from '../../services/campaing/Update'
import { FindParams, IndexQuery, StoreData } from './types'

const schema = Yup.object().shape({ name: Yup.string().required()})

class CampaignController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery
      const { companyId } = req.user
  
      const { records, count, hasMore } = await listCampaigns({
        searchParam,
        pageNumber,
        companyId
      })
      return res.status(200).json({ records, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar campanhas" })
      throw new AppError(`Ocorreu um erro ao recuperar campanhas: ${error.message}`, 500)
    }
  }
  
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.user
      const data = req.body as StoreData
  
      try { await schema.validate(data)} 
      catch (error: any) { throw new AppError(error.message)}

      if (typeof data.tagListId === 'number') {
        const tagId = data.tagListId
        const campanhaNome = data.name
  
        async function createContactListFromTag(tagId: number) {
          const currentDate = new Date()
          const formattedDate = currentDate.toISOString()
  
          try {
            const ticketTags = await prisma.ticketTag.findMany({ where: { tagId } })
            const ticketIds = ticketTags.map((ticketTag) => ticketTag.ticketId)
  
            const tickets = await prisma.ticket.findMany({ where: { id: Number(ticketIds) } })
            const contactIds = tickets.map((ticket) => ticket.contactId)
  
            const contacts = await prisma.contact.findMany({ where: { id: Number(contactIds) } })
  
            const randomName = `${campanhaNome} | TAG: ${tagId} - ${formattedDate}`
            const contactList = await prisma.contactList.create({
              data: { name: randomName, companyId }
            })
  
            const { id: contactListId } = contactList
  
            const contactListItems = contacts.map((contact) => ({
              name: contact.name,
              number: contact.number,
              email: contact.email,
              contactListId,
              companyId,
              isWhatsappValid: true
            }))
  
            await prisma.contactListItem.createMany({ data: contactListItems })
            return contactListId
          } catch (error: any) {
            console.error('Erro ao criar lista de contatos:', error)
            throw new AppError('Erro ao criar lista de contatos')
          }
        }
        try {
          const contactListId = await createContactListFromTag(tagId)
          const createData: Prisma.CampaignUncheckedCreateInput = {
            ...data,
            companyId: Number(companyId),
            contactListId: Number(contactListId),
            fileListId: data.fileListId || undefined,
            mediaPath: '',
            mediaName: '',
            whatsappId: 0
          }
          const CreateCampaign = await prisma.campaign.create({ data: createData })

          const io = getIO()
          io.emit(`company=${companyId}-campaign`, { action: "create", CreateCampaign })
  
          return res.status(200).json(CreateCampaign)
        } catch (error: any) {
          console.error('Erro: ', error)
          return res.status(500).json({ error: 'Erro ao criar campanha' })
        }
      } else {
        try {
          const createData: Prisma.CampaignUncheckedCreateInput = {
            ...data,
            companyId: Number(companyId),
            fileListId: data.fileListId || undefined,
            mediaPath: '',
            mediaName: '',
            whatsappId: 0
        };
          const createCampaign = await prisma.campaign.create({ data: createData })

          const io = getIO()
          io.emit(`company-${companyId}-campaign`, { action: "create", createCampaign })
  
          return res.status(200).json(createCampaign)
        } catch (error: any) {
          console.error('Erro: ', error)
          return res.status(500).json({ error: 'Erro ao criar campanha' })
        }
      }
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar campanha" })
      throw new AppError(`Ocorreu um erro ao criar campanha: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const record = await showCampaign(id)
      return res.status(200).json(record)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir campanha" })
      throw new AppError(`Ocorreu um erro ao exibir campanha: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as StoreData
      const { companyId } = req.user

      try { await schema.validate(data)} 
      catch (error: any) { throw new AppError(error.message)}

      const { id } = req.params

      const updateCampaign = await updateCampaignService({
        ...data, id: Number(id),
        whatsappId: 0
      })

      const io = getIO()
      io.emit(`company-${companyId}-campaign`, { action: "update", updateCampaign })

      return res.status(200).json(updateCampaign)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar campanha" })
      throw new AppError(`Ocorreu um erro ao atualizar campanha: ${error.message}`, 500)
    }
  }

  public async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      await cancelService(+id)
      return res.status(200).json({ message: "Cancelamento realizado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao cancelar campanha" })
      throw new AppError(`Ocorreu um erro ao cancelar campanha: ${error.message}`, 500)
    }
  }

  public async restart(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      await restartCampaign(+id)
      return res.status(200).json({
          success: true,
          message: `Campanha ${req.params.id} reiniciada com sucesso`,
        })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao reiniciar campanha" })
      throw new AppError(`Ocorreu um erro ao reiniciar campanha: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { companyId } = req.user

      await deleteCampaign(id)
      
      const io = getIO()
      io.emit(`company-${companyId}-campaign`, { action: "delete", id })

      return res.status(200).json({ message: "Campanha deletada" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar campanha" })
      throw new AppError(`Ocorreu um erro ao deletar campanha: ${error.message}`, 500)
    }
  }

  public async findList(req: Request, res: Response): Promise<Response> {
    try {
      const params = req.query as FindParams
      const result: Campaign[] = await findCampaigns(params)
      return res.status(200).json(result)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar campanhas" })
      throw new AppError(`Ocorreu um erro ao listar campanhas: ${error.message}`, 500)
    }
  }

  public async mediaUpload(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const files = req.files as Express.Multer.File[]
      const file = head(files)
  
      if (!file) { 
        throw new AppError("Arquivo não encontrado", 404) 
      }

      await prisma.campaign.update({ 
        where: { id: Number(id) },
        data: {
          mediaPath: file.filename,
          mediaName: file.originalname
        }
      })

      return res.status(200).send({ message: "Mensagem Enviada" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao enviar arquivo" })
      throw new AppError(`Ocorreu um erro ao enviar arquivo: ${error.message}`, 500)
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<Response> {
    const { id } = req.params

    try {
      const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } })
      if (!campaign) { throw new AppError("Campanha não encontrada", 404)}

      const filePath = path.resolve("public", campaign.mediaPath)
      const fileExists = fs.existsSync(filePath)
      if (fileExists) { fs.unlinkSync(filePath)}

      await prisma.campaign.update({
        where: { id: Number(id) },
        data: {
          mediaName: null,
          mediaPath: null
        }
      })

      return res.send({ mensagem: "Arquivo excluido" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar arquivo" })
      throw new AppError(`Ocorreu um erro ao deletar arquivo: ${error.message}`, 500)
    }
  }
}

export default new CampaignController()