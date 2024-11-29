import { Tag } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowTag = async (id: string | number): Promise<Tag> => {
  try {
    const tag = await prisma.tag.findUnique({
      where: {
        id: typeof id === 'string' ? parseInt(id, 10) : id,
      },
    })

    if (!tag) {
      throw new AppError('ERR_NO_TAG_FOUND', 404)
    }

    return tag
  } catch (error: any) {
    throw new AppError('Erro ao buscar a tag', 500)
  }
}

export default ShowTag
