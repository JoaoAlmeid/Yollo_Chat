import { isEmpty, isNil } from 'lodash'

export default function getCampaignValidMessages(campaign: {
  message1?: string
  message2?: string
  message3?: string
  message4?: string
  message5?: string
}): string[] {
  // Cria um array com todas as mensagens da campanha
  const messages = [
    campaign.message1,
    campaign.message2,
    campaign.message3,
    campaign.message4,
    campaign.message5,
  ]

  // Filtra mensagens não vazias e não nulas
  return messages.filter(
    (message): message is string =>
      !isEmpty(message) && !isNil(message) && message.trim() !== ''
  )
}
