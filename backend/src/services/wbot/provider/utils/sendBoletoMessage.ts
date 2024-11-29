import { sleep } from './sleep'
import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import formatBody from '../../../../helpers/Mustache'

export const sendBoletoMessage = async (
  boletoInfo: any,
  contact: Contact,
  ticket: Ticket,
  wbot: WASocket
) => {
  const valorCorrigido = boletoInfo.valor.replace('.', ',')
  const datavencCorrigida = boletoInfo.data_vencimento
    .split('-')
    .reverse()
    .join('/')

  const body = {
    text: await formatBody(
      `Segue a segunda-via da sua Fatura!\n\n
        *Fatura:* ${boletoInfo.id}\n
        *Nome:* ${contact.name}\n
        *Valor:* R$ ${valorCorrigido}\n
        *Data Vencimento:* ${datavencCorrigida}\n\n
        Vou mandar o *código de barras* na próxima mensagem para ficar mais fácil para você copiar!`,
      contact
    ),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )
}
