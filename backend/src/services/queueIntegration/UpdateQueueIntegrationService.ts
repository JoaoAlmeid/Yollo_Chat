import * as Yup from "yup"
import prisma from "../../prisma/client"
import { QueueIntegrations } from "@prisma/client"
import AppError from "src/errors/AppError"
import ShowIntegrationService from "./ShowQueueIntegrationService"
import { RequestU } from "./types"
import validateQueueIntegration from "./validation"

const UpdateQueueIntegrationService = async ({
  integrationData,
  integrationId,
  companyId
}: RequestU): Promise<QueueIntegrations> => {
  const {
    type,
    name,
    projectName,
    jsonContent,
    language,
    urlN8N,
    typebotExpires,
    typebotKeywordFinish,
    typebotSlug,
    typebotUnknownMessage,
    typebotDelayMessage,
    typebotKeywordRestart,
    typebotRestartMessage 
  } = integrationData
  validateQueueIntegration(integrationData)
  
  // Obtém a integração existente
  const integration = await ShowIntegrationService(integrationId, companyId)

  // Atualiza a integração
  const updatedIntegration = await prisma.queueIntegrations.update({
    where: { id: integration.id },
    data: {
      type,
      name,
      projectName,
      jsonContent,
      language,
      urlN8N,
      companyId,
      typebotExpires,
      typebotKeywordFinish,
      typebotSlug,
      typebotUnknownMessage,
      typebotDelayMessage,
      typebotKeywordRestart,
      typebotRestartMessage 
    }
  })

  return updatedIntegration
}

export default UpdateQueueIntegrationService