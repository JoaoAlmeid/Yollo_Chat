import { Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import { ReqListUser, ResListUser } from '../../@types/User'

const ListUsers = async ({ searchParam = '', pageNumber = 1, companyId }: ReqListUser): Promise<ResListUser> => {
  try {
    const whereCondition: Prisma.UserWhereInput = {
      OR: [
        { name: { contains: searchParam.toLowerCase() } },
        { email: { contains: searchParam.toLowerCase() } },
      ],
      companyId: companyId
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        name: true,
        id: true,
        email: true,
        companyId: true,
        profile: true,
        createdAt: true,
        queues: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (+pageNumber - 1) * 20,
    })

    const count = await prisma.user.count({ where: whereCondition })
    const hasMore = count > (+pageNumber - 1) * 20 + users.length

    return {
      users,
      count,
      hasMore,
    }
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`)
    } else {
      throw new Error('Erro desconhecido')
    }
  }
}

export default ListUsers
