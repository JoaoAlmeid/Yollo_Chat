import { Prisma, Tag } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { RequestListTag } from '../../@types/Tag'

const SimpleList = async ({
  companyId,
  searchParam,
}: RequestListTag): Promise<Tag[]> => {
  try {
    const whereCondition: Prisma.TagWhereInput = {
      companyId,
    }

    if (searchParam) {
      whereCondition.AND = {
        OR: [
          { name: { contains: searchParam } },
          { color: { contains: searchParam } },
        ],
      }
    }

    const tags = await prisma.tag.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc',
      },
    })

    return tags
  } catch (error: any) {
    throw new AppError('Erro ao buscar as tags', 500)
  }
}

export default SimpleList
