import AppError from '../../errors/AppError'
import { Prisma, Help } from '@prisma/client'
import prisma from '../../prisma/client'
import { DataHelp } from '../../@types/Help'

const UpdateHelp = async (data: DataHelp): Promise<Help> => {
  const { id, title, description, video, link } = data

  try {
    const updatedHelp = await prisma.help.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        video,
        link,
      },
    })

    return updatedHelp
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new AppError('ERR_PRISMA_OPERATION_FAILED', 500)
    } else {
      console.error(`Error ao Atualizar Help: ${error}`)
      throw new AppError('ERR_INTERNAL_SERVER_ERROR', 500)
    }
  }
}

export default UpdateHelp
