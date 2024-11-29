import ShowService from "./ShowService"
import prisma from "../../../prisma/client"
import AppError from "src/errors/AppError"

const DeleteQOptionService = async (queueOptionId: number | string): Promise<void> => {
  // Obtém a opção de fila
  const queueOption = await ShowService(queueOptionId)

  // Verifica se a opção de fila foi encontrada
  if (!queueOption) {
    throw new AppError("ERR_NO_QUEUE_OPTION_FOUND", 404)
  }

  // Remove a opção de fila do banco de dados
  await prisma.queueOption.delete({
    where: { id: Number(queueOptionId) }
  })
}

export default DeleteQOptionService
