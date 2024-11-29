import { Request, Response } from 'express'
import { Ticket } from '@prisma/client'
import AppError from '../../errors/AppError'
import { getIO } from 'src/libs/socket'

import ListTicketsKanban from 'src/services/tickets/ListTicketKanban'
import ShowTicketUUID from 'src/services/tickets/ShowTicketFromUUID'
import CreateTicket from '../../services/tickets/CreateTicket'
import DeleteTicket from '../../services/tickets/DeleteTicket'
import UpdateTicket from 'src/services/tickets/UpdateTicket'
import ListTickets from '../../services/tickets/ListTicket'
import ShowTicket from '../../services/tickets/ShowTicket'
import { IndexQuery, TicketData } from './types'

class TicketController {
  public async index(req: Request, res: Response): Promise<Response> {
    const {
      pageNumber,
      status,
      date,
      updatedAt,
      searchParam,
      showAll,
      queueIds: queueIdsStringified,
      tags: tagIdsStringified,
      users: userIdsStringified,
      withUnreadMessages,
    } = req.query as IndexQuery

    const userId = req.user.id.toString()
    const companyId = req.user.companyId.toString()

    let queueIds: number[] = []
    let tagsIds: number[] = []
    let userIds: number[] = []

    if (queueIdsStringified) {
      queueIds = JSON.parse(queueIdsStringified)
    }

    if (tagIdsStringified) {
      tagsIds = JSON.parse(tagIdsStringified)
    }

    if (userIdsStringified) {
      userIds = JSON.parse(userIdsStringified)
    }

    try {
      const { tickets, count, hasMore } = await ListTickets({
        searchParam,
        tags: tagsIds,
        users: userIds,
        pageNumber,
        status,
        date,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        companyId,
      })

      return res.status(200).json({ tickets, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar ticket" })
      throw new AppError(`Ocorreu um erro ao recuperar ticket: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    const { contactId, status, userId, queueId, whatsappId }: TicketData = req.body
    const { companyId } = req.user

    try {
      const ticket = await CreateTicket({
        contactId,
        status,
        userId,
        companyId,
        queueId,
        whatsappId
      })

      const io = getIO()
      io.to(ticket.status).emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      })

      return res.status(200).json(ticket)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar ticket" })
      throw new AppError(`Ocorreu um erro ao criar ticket: ${error.message}`, 500)
    }
  }

  public async kanban(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        pageNumber, 
        status,
        date,
        updatedAt,
        searchParam,
        showAll,
        queueIds: queueIdsStringified,
        tags: tagIdsStringified,
        users: userIdsStringified,
        withUnreadMessages  
      } = req.query as IndexQuery
      
      const userId = req.user.id.toString()
      const companyId = req.user.companyId.toString()

      let queueIds: number[] = [];
      let tagsIds: number[] = [];
      let usersIds: number[] = [];

      if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
      }

      if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
      }

      if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
      }

      const { tickets, count, hasMore } = await ListTicketsKanban({
        searchParam,
        tags: tagsIds,
        users: usersIds,
        pageNumber,
        status,
        date,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        companyId
      })

      return res.status(200).json({ tickets, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar kanban" })
      throw new AppError(`Ocorreu um erro ao listar kanban: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params
      const { companyId } = req.user

      const contact = await ShowTicket(ticketId, companyId)
      
      return res.status(200).json(contact)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir ticket" })
      throw new AppError(`Ocorreu um erro ao exibir ticket: ${error.message}`, 500)
    }
  }

  public async showFromUUID(req: Request, res: Response): Promise<Response> {
    try {
      const { uuid } = req.params

      const ticket: Ticket = await ShowTicketUUID(uuid)

      return res.status(200).json(ticket)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir ticket" })
      throw new AppError(`Ocorreu um erro ao exibir ticket: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params
      const ticketData: TicketData = req.body
      const { companyId } = req.user

      const { ticket } = await UpdateTicket({
        ticketData,
        ticketId: Number(ticketId),
        companyId
      })

      return res.status(200).json(ticket)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar ticket" })
      throw new AppError(`Ocorreu um erro ao atualizar ticket: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params
      const { companyId } = req.user
      
      await ShowTicket(ticketId, companyId)
      
      const ticket = await DeleteTicket(ticketId)

      const io = getIO()
      io.to(ticket.status)
        .to(ticketId)
        .to("notification")
        .emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticketId: +ticketId
        })

      return res.status(200).json({ message: "Ticket deletado" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar ticket" })
      throw new AppError(`Ocorreu um erro ao deletar ticket: ${error.message}`, 500)
    }
  }
}

export default new TicketController()
