import prisma from "../../prisma/client";
import AppError from "src/errors/AppError";

const DeleteQueueIntegrationService = async (id: number): Promise<void> => {
  // Encontra a integração de fila com o id fornecido
  const queueIntegration = await prisma.queueIntegrations.findUnique({
    where: { id }
  })

  if (!queueIntegration) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404)
  }

  // Remove a integração de fila
  await prisma.queueIntegrations.delete({
    where: { id }
  })
}

export default DeleteQueueIntegrationService