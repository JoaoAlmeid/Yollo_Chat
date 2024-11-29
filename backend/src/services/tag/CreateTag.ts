import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { Tag } from '@prisma/client'
import { RequestTag } from '../../@types/Tag'
import { createTagSchema } from '../../schemas/tagSchemas'

const CreateTag = async ({
  name,
  color = '#A4CCCC',
  kanban = 0,
  companyId,
}: RequestTag): Promise<Tag> => {
  try {
    await createTagSchema.validate({ name })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  // Verifica se a tag já existe
  let tag = await prisma.tag.findFirst({
    where: { name, color, companyId, kanban },
  })

  // Se a tag não existir, cria uma nova
  if (!tag) {
    tag = await prisma.tag.create({
      data: {
        name,
        color,
        companyId,
        kanban,
        updatedAt: new Date(),
      },
    })
  }

  return tag
}

export default CreateTag
