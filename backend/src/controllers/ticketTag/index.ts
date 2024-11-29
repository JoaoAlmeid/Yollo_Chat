import { Request, Response } from 'express'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

class TicketTagController {
  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId, tagId } = req.params

      // Verificar se ticketId e tagId são números válidos
      const ticketIdNumber = Number(ticketId)
      const tagIdNumber = Number(tagId)

      if (isNaN(ticketIdNumber) || isNaN(tagIdNumber)) {
        throw new AppError('ticketId e tagId devem ser números válidos', 400)
      }

      // Criar uma nova associação entre Ticket e Tag
      const ticketTag = await prisma.ticketTag.create({
        data: {
          ticketId: ticketIdNumber,
          tagId: tagIdNumber,
          updatedAt: new Date(),
        },
      })

      return res.status(201).json(ticketTag)
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 500)
          .json({ message: error.message })
      }
      return res
        .status(500)
        .json({ message: 'Falha ao armazenar a tag do ticket.' })
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params
      
      // Verificar se ticketId é um número válido
      const ticketIdNumber = Number(ticketId)
      if (isNaN(ticketIdNumber)) {
        throw new AppError('ticketId deve ser um número válido', 400)
      }

      // Recuperar tagIds associados ao ticketId fornecido
      const ticketTags = await prisma.ticketTag.findMany({
        where: { ticketId: ticketIdNumber },
      })

      const tagIds = ticketTags.map(ticketTag => ticketTag.tagId)

      // Encontrar os tagIds com kanban = 1 na tabela Tags
      const tagsWithKanbanOne = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          kanban: 1,
        },
      })

      const tagIdsWithKanbanOne = tagsWithKanbanOne.map(tag => tag.id)

      if (tagIdsWithKanbanOne.length > 0) {
        // Remover os tagIds com kanban = 1 dos TicketTags
        await prisma.ticketTag.deleteMany({
          where: {
            ticketId: ticketIdNumber,
            tagId: { in: tagIdsWithKanbanOne },
          },
        })
      }

      return res
        .status(200)
        .json({ message: 'Tags do ticket removidas com sucesso.' })
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode || 500)
          .json({ message: error.message })
      }
      return res
        .status(500)
        .json({ message: 'Falha ao remover as tags do ticket.' })
    }
  }
}

export default new TicketTagController()
