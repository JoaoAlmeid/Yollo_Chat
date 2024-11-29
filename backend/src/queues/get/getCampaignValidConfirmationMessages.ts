import { isEmpty, isNil } from 'lodash'

export default function getCampaignValidConfirmationMessages(campaign: {
  confirmationMessage1?: string
  confirmationMessage2?: string
  confirmationMessage3?: string
  confirmationMessage4?: string
  confirmationMessage5?: string
}): string[] {
  // Cria um array com todas as mensagens de confirmação da campanha
  const messages = [
    campaign.confirmationMessage1,
    campaign.confirmationMessage2,
    campaign.confirmationMessage3,
    campaign.confirmationMessage4,
    campaign.confirmationMessage5,
  ]

  // Filtra mensagens não vazias e não nulas
  return messages.filter(
    (message): message is string =>
      !isEmpty(message) && !isNil(message) && message.trim() !== ''
  )
}
