import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

interface Params {
  companyId: string | number
}

const SimpleList = async ({ companyId }: Params): Promise<any[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: Number(companyId),
      },
      select: {
        name: true,
        id: true,
        email: true,
        queues: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    })

    if (!users || users.length === 0) {
      throw new AppError('ERR_NO_USER_FOUND', 404)
    }

    return users
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error
    } else {
      throw new AppError('Erro ao listar usuários.')
    }
  }
}

export default SimpleList
