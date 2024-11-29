import { Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { RequestListTag, ResponseListTag } from '../../@types/Tag'

const ListTags = async ({
  companyId,
  searchParam,
  pageNumber = 1,
  pageSize = 20,
}: RequestListTag): Promise<ResponseListTag> => {
  try {
    const limit = pageSize
    const offset = limit * (pageNumber - 1)

    const whereCondition: Prisma.TagWhereInput = {
      companyId,
      AND: {},
    }

    if (searchParam) {
      whereCondition.AND = {
        OR: [
          { name: { contains: searchParam } },
          { color: { contains: searchParam } },
        ],
      }
    }

    const tagsCount = await prisma.tag.count({ where: whereCondition })
    const tags = await prisma.tag.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    })

    const hasMore = tagsCount > offset + tags.length

    return {
      tags,
      count: tagsCount,
      hasMore,
    }
  } catch (error: any) {
    throw new AppError('Erro ao buscar as tags', 500)
  }
}

export default ListTags
