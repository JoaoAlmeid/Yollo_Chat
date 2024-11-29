import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Tag } from '@prisma/client'
import { RequestUpTag } from '../../@types/Tag'
import { updateTagSchema } from '../../schemas/tagSchemas'

const UpdateTag = async ({
  tagData,
  id,
}: RequestUpTag): Promise<Tag | null> => {
  const tagId = typeof id === 'string' ? parseInt(id, 10) : id // Valida se o ID é um número ou uma string válida
  const tag = await prisma.tag.findUnique({ where: { id: tagId } }) // Encontra a tag com base no ID fornecido

  if (!tag) {
    throw new AppError(`Tag com ID ${id} não encontrada.`)
  }

  const { name, color, kanban } = tagData

  // Valida os dados fornecidos
  try {
    await updateTagSchema.validate({ name, color, kanban })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  // Atualiza a tag com os novos dados
  const updatedTag = await prisma.tag.update({
    where: { id: tagId },
    data: {
      name,
      color,
      kanban,
    },
  })

  return updatedTag
}

export default UpdateTag
