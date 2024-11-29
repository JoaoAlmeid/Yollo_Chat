import prisma from '../../prisma/client'
import { Prisma } from '@prisma/client'
import { RequestListSchedule, ResponseListSchedule } from '../../@types/Schedule'

const ListSchedule = async ({
  searchParam,
  contactId = null,
  userId = null,
  pageNumber = '1',
  companyId,
}: RequestListSchedule): Promise<ResponseListSchedule> => {
  const limit = 20
  const offset = limit * (parseInt(pageNumber as string) - 1)

  let whereCondition: Prisma.ScheduleWhereInput = { companyId: companyId }

  if (searchParam) {
    const searchParamLower = searchParam.toLowerCase()
    whereCondition = {
      ...whereCondition,
      OR: [
        {
          body: {
            contains: searchParamLower,
          },
        },
        {
          contact: {
            name: {
              contains: searchParamLower,
            },
          },
        },
      ],
    }
  }

  if (contactId) {
    whereCondition = {
      ...whereCondition,
      contactId: Number(contactId),
    }
  }

  if (userId) {
    whereCondition = {
      ...whereCondition,
      userId: Number(userId),
    }
  }

  const schedulesCount = await prisma.schedule.count({ where: whereCondition })
  const schedules = await prisma.schedule.findMany({
    where: whereCondition,
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const hasMore = schedulesCount > offset + schedules.length

  return {
    schedules,
    count: schedulesCount,
    hasMore,
  }
}

export default ListSchedule
