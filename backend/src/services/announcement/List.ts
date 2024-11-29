import { isEmpty } from 'lodash'
import { LRequest, LResponse } from '../../@types/Announcement'
import prisma from '../../prisma/client'

const ListService = async ({ searchParam = '', pageNumber = '1' }: LRequest): Promise<LResponse> => {
  let whereCondition: any = {
    status: true
  }

  if (!isEmpty(searchParam)) {
    whereCondition = {
      ...whereCondition,
      OR: [
        {
          title: {
            contains: searchParam.trim(),
            mode: 'insensitive'
          }
        }
      ]
    }
  }

  const limit = 20
  const offset = limit * (+pageNumber - 1)

  const [records, count] = await Promise.all([
    prisma.announcement.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where: whereCondition }),
  ])

  const hasMore = count > offset + records.length

  return {
    records,
    count,
    hasMore,
  }
}

export default ListService