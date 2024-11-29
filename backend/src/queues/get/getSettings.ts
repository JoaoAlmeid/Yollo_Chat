import prisma from '../../prisma/client'

interface SettingsResponse {
  messageInterval: number
  longerIntervalAfter: number
  greaterInterval: number
  variables: any[]
}

export default async function getSettings(campaign: {
  companyId?: number
}): Promise<SettingsResponse> {
  // Obtém as configurações da campanha do banco de dados
  const settings = await prisma.campaignSetting.findMany({
    where: { companyId: campaign.companyId },
    select: {
      key: true,
      value: true,
    },
  })

  // Define valores padrão
  let messageInterval = 20
  let longerIntervalAfter = 20
  let greaterInterval = 60
  let variables: any[] = []

  // Itera pelas configurações e atualiza os valores conforme necessário
  settings.forEach(setting => {
    switch (setting.key) {
      case 'messageInterval':
        messageInterval = JSON.parse(setting.value)
        break
      case 'longerIntervalAfter':
        longerIntervalAfter = JSON.parse(setting.value)
        break
      case 'greaterInterval':
        greaterInterval = JSON.parse(setting.value)
        break
      case 'variables':
        variables = JSON.parse(setting.value)
        break
    }
  })

  // Retorna o objeto com os valores das configurações
  return {
    messageInterval,
    longerIntervalAfter,
    greaterInterval,
    variables,
  }
}
