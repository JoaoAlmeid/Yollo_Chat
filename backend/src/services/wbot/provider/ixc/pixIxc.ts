import { initializeProviderConfig } from '../utils/initializeProviderConfig'
import formatBody from '../../../../helpers/Mustache'
import { Contact, Ticket } from '@prisma/client'
import { sleep } from '../utils/sleep'
import { WASocket } from '@whiskeysockets/baileys'
import axios from 'axios'

export const consultaPixIxc = async (idBoleto: string, companyId: number) => {
  try {
    const config = await initializeProviderConfig(companyId)
    const { urlIxc, ixckeyBase64 } = config

    const options = {
      method: 'GET',
      url: `${urlIxc}/webservice/v1/get_pix`,
      headers: {
        ixcsoft: 'listar',
        Authorization: `Basic ${ixckeyBase64}`,
      },
      data: { id_areceber: idBoleto },
    }

    const response = await axios.request(options as any)
    return response.data
  } catch (error: any) {
    console.error(`Erro ao consultar pix ${idBoleto}:`, error)
    throw new Error('Erro ao consultar pix.')
  }
}

export const sendPixMessage = async (
  pix: any,
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
      `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${boletoInfo.id}\n*Nome:* ${contact.name}\n*Valor:* R$ ${valorCorrigido}\n*Data Vencimento:* ${datavencCorrigida}\n\nVou te enviar o *Código de Barras* e o *PIX* basta clicar em qual você quer utlizar que já vai copiar! Depois basta realizar o pagamento no seu banco`,
      contact
    ),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )

  const body_linha_digitavel = {
    text: await formatBody(`${boletoInfo.linha_digitavel}`, contact),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body_linha_digitavel
  )

  const body_pix_dig = {
    text: await formatBody(`${pix.pix.qrCode.qrcode}`, contact),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body_pix_dig
  )
}
