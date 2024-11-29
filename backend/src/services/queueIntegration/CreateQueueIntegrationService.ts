import * as Yup from "yup"
import AppError from "src/errors/AppError"
import { QueueIntegrations } from "@prisma/client"
import { IntegrationData } from "src/@types/Queues"
import prisma from "../../prisma/client"

const CreateQueueIntegrationService = async ({
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
}: IntegrationData): Promise<QueueIntegrations> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "ERR_INTEGRATION_NAME_ALREADY_USED",
        async value => {
          if (!value) return false
          const nameExists = await prisma.queueIntegrations.findFirst({
            where: { name: value, companyId }
          })
          return !nameExists
        }
      )
  })

  try {
    await schema.validate({ name })
  } catch (err) {
    throw new AppError(err.message)
  }


  // Cria a integração de fila no banco de dados
  const queueIntegration = await prisma.queueIntegrations.create({
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

  return queueIntegration
}

export default CreateQueueIntegrationService