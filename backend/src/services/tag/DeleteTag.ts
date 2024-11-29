import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteTag = async (id: string | number): Promise<void> => {
  const tag = await prisma.tag.findUnique({ where: { id: Number(id) } })

  if (!tag) {
    throw new AppError('ERR_NO_TAG_FOUND', 404)
  }

  await prisma.tag.delete({ where: { id: Number(id) } })
}

export default DeleteTag
