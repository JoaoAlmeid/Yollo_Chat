import prisma from "../../prisma/client"
import { QueueIntegrations } from "@prisma/client"
import AppError from "../../errors/AppError"


const ShowQueueIntegrationService = async (id: string | number, companyId: number): Promise<QueueIntegrations> => {
  // Encontrar a integração de fila pelo ID
  const integration = await prisma.queueIntegrations.findUnique({
    where: { id: Number(id) }
  })

  // Verifica se a integração foi encontrada e se pertence à empresa
  if (!integration || integration.companyId !== companyId) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404)
  }

  return integration
}

export default ShowQueueIntegrationService