import { Tag } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const KanbanList = async (companyId: number): Promise<Tag[]> => {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        kanban: 1,
        companyId: companyId,
      },
      orderBy: { id: 'asc' },
    })

    return tags
  } catch (error: any) {
    throw new AppError('Erro ao buscar as tags do kanban', 500)
  }
}

export default KanbanList
