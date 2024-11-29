import * as Yup from 'yup'
import { Request, Response } from 'express'
import AppError from 'src/errors/AppError'
import { TicketNote } from '@prisma/client'

// Services
import CreateTicketNote from '../../services/tickets/note/CreateTicketNote'
import DeleteTicketNote from '../../services/tickets/note/DeleteTicketNote'
import FindAllTicketNotes from '../../services/tickets/note/FindAllTicketNote'
import FindNotesById from '../../services/tickets/note/FindNoteById'
import ListTicketNotes from '../../services/tickets/note/ListTicketNote'
import ShowTicketNote from '../../services/tickets/note/ShowTicketNote'
import UpdateTicketNote from '../../services/tickets/note/UpdateTicketNote'

// Tipos
import { IndexQuery, QueryFilteredNotes, StoreTicketNoteData, UpdateTicketNoteData } from './types'

const schema = Yup.object().shape({
  note: Yup.string().required()
})

class TicketNoteController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam, pageNumber } = req.query as IndexQuery

      const { ticketNotes, count, hasMore } = await ListTicketNotes({
        searchParam,
        pageNumber: Number(pageNumber)
      })

      return res.status(200).json({ ticketNotes, count, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar observações" })
      throw new AppError(`Ocorreu um erro ao recuperar observações: ${error.message}`, 500)
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const ticketNotes: TicketNote[] = await FindAllTicketNotes()

      return res.status(200).json(ticketNotes)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao listar observações" })
      throw new AppError(`Ocorreu um erro ao listar observações: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const newTicketNote: StoreTicketNoteData = req.body
      const { id: userId } = req.user

      try {
        await schema.validate(newTicketNote)
      } catch (error: any) {
        throw new AppError(error.message)
      }

      const { id, ...rest } = newTicketNote
      const ticketNote = await CreateTicketNote({
        ...rest,
        userId,
      })

      return res.status(200).json(ticketNote)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar observação" })
      throw new AppError(`Ocorreu um erro ao criar observação: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const ticketNote = await ShowTicketNote(id)
      
      return res.status(200).json(ticketNote)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir observação" })
      throw new AppError(`Ocorreu um erro ao exibir observação: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const ticketNote: UpdateTicketNoteData = req.body

      if (typeof ticketNote.id === 'string') {
        ticketNote.id = parseInt(ticketNote.id, 10)
      }

      try {
        await schema.validate(ticketNote);
      } catch (err) {
        throw new AppError(err.message);
      }

      const recordUpdated = await UpdateTicketNote(ticketNote)

      return res.status(200).json(recordUpdated)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar observação" })
      throw new AppError(`Ocorreu um erro ao atualizar observação: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403)
      }

      await DeleteTicketNote(id)
      return res.status(200).json({ message: "Observação removida" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar observação" })
      throw new AppError(`Ocorreu um erro ao deletar observação: ${error.message}`, 500)
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { contactId, ticketId } = req.query as unknown as QueryFilteredNotes
      const notes: TicketNote[] = await FindNotesById({ 
        contactId, 
        ticketId 
      })
      return res.status(200).json(notes)
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao filtrar observação" })
      throw new AppError(`Ocorreu um erro ao filtrar observação: ${error.message}`, 500)
    }
  }
}

export default new TicketNoteController()
