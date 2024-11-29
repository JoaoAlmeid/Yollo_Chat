import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteQMesssage = async (id: number): Promise<void> => {
  // Encontre o registro com base no id
  const record = await prisma.quickMessage.findUnique({
    where: { id: Number(id) },
  })

  // Se o registro não for encontrado, lança um erro
  if (!record) {
    throw new AppError('ERR_NO_QUICKMESSAGE_FOUND', 404)
  }

  // Exclua o registro
  await prisma.quickMessage.delete({
    where: { id: Number(id) },
  })
}

export default DeleteQMesssage