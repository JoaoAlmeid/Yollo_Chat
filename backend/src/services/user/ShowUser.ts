import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowUser = async (id: string | number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        name: true,
        id: true,
        email: true,
        companyId: true,
        profile: true,
        super: true,
        tokenVersion: true,
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
    })

    if (!user) {
      throw new AppError('ERR_NO_USER_FOUND', 404)
    }

    return user
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error
    } else {
      throw new AppError('Erro ao buscar usuário.')
    }
  }
}

export default ShowUser
