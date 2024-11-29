import axios from 'axios'
import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import prisma from '../../../prisma/client'
import puppeteer from 'puppeteer'
import sendMessageImage from '../messageListener/send/sendMessageImage'
import sendMessageLink from '../messageListener/send/sendMessageLink'
import { validaCpfCnpj } from '../messageListener/validate/ValidarCpfCnpj'
import { clienteAsaas } from './asaas/clienteAsaas'
import { initializeProviderConfig } from './utils/initializeProviderConfig'
import { getAndCleanCpfCnpj } from './utils/getAndCleanCpfCnpj'
import { authenticateMKAuth } from './utils/authenticateMKAuth'
import { fetchClientData } from './utils/fetchClientData'
import { sendWhatsAppMessage } from './utils/sendMessage'

const updateTicketStatus = async (ticketId: number, status: string) => {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status },
  })
}

const processBoletos = async (
  clientDataMKAuth: any,
  contact: Contact,
  ticket: Ticket,
  wbot: WASocket,
  url: string,
  jwt: string
) => {
  const {
    nome,
    valor,
    bloqueado,
    uuid_cliente,
    qrcode,
    linhadig,
    status,
    datavenc,
    titulo,
  } = clientDataMKAuth.dados_cliente.titulos

  const statusCorrigido = status[0].toUpperCase() + status.slice(1)
  const valorCorrigido = valor.replace('.', ',')
  const curdate = new Date(datavenc)
  const anoMesDia = `${('0' + curdate.getDate()).slice(-2)}/${('0' + (curdate.getMonth() + 1)).slice(-2)}/${curdate.getFullYear()}`

  // Mensagem de localização de cadastro
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Localizei seu Cadastro! *${contact.name}* só mais um instante por favor!`
  )

  // Mensagem de envio da 2° Via
  const bodyBoleto = `
    Segue a segunda-via da sua Fatura!\n\n
    *Nome:* ${nome}\n
    *Valor:* R$ ${valorCorrigido}\n
    *Data Vencimento:* ${anoMesDia}\n
    *Link:* ${url}/boleto/21boleto.php?titulo=${titulo}\n\n
    Vou mandar o *código de barras* na próxima mensagem para ficar mais fácil para você copiar!`

  await sendWhatsAppMessage(wbot, contact, ticket, bodyBoleto)
  await sendWhatsAppMessage(wbot, contact, ticket, linhadig)

  if (qrcode) {
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Este é o *PIX COPIA E COLA*'
    )
    await sendWhatsAppMessage(wbot, contact, ticket, qrcode)

    const linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${qrcode}`
    await sendMessageImage(wbot, contact, ticket, linkBoleto, '')
  }

  // Mensagem de envio do boleto em PDF
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    'Agora vou te enviar o boleto em *PDF* caso você precise.'
  )

  const nomePDF = `Boleto-${nome}-${('0' + curdate.getDate()).slice(-2)}-${('0' + (curdate.getMonth() + 1)).slice(-2)}-${curdate.getFullYear()}.pdf`
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  const websiteUrl = `${url}/boleto/21boleto.php?titulo=${titulo}`
  await page.goto(websiteUrl, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('screen')
  await page.pdf({
    path: nomePDF,
    printBackground: true,
    format: 'A4',
  })
  await browser.close()
  await sendMessageLink(wbot, contact, ticket, nomePDF, nomePDF)

  if (bloqueado === 'sim') {
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      `${nome}, vi também que a sua conexão está bloqueada! Vou desbloquear para você por *48 horas*.`
    )
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Estou liberando seu acesso. Por favor aguarde!'
    )

    try {
      await axios.get(
        `${url}/api/cliente/desbloqueio/${uuid_cliente}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )

      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'Pronto liberei! Vou precisar que você *retire* seu equipamento da tomada.\n\n*OBS: Somente retire da tomada.* \nAguarde 1 minuto e ligue novamente!'
      )
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'Veja se seu acesso voltou! Caso não tenha voltado, retorne o contato e fale com um atendente!'
      )

      // Atualiza o status do cliente no DB
      await updateTicketStatus(uuid_cliente, 'Desbloqueado')
    } catch (error: any) {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'Opss! Algo de errado aconteceu! Digite *#* para voltar ao menu anterior e fale com um atendente!'
      )
    }
  }

  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    'Obrigado pelo seu contato! Posso te ajudar em mais alguma coisa?'
  )
}

const desbloquearConexao = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  jwt: string,
  uuid_cliente: string,
  url: string
) => {
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `${contact.name}, vi também que a sua conexão está bloqueada! Vou desbloquear para você por *48 horas*.`
  )
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    'Estou liberando seu acesso. Por favor aguarde!'
  )

  try {
    await axios.get(
      `${url}/api/cliente/desbloqueio/${uuid_cliente}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )

    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Pronto liberei! Vou precisar que você *retire* seu equipamento da tomada.\n\n*OBS: Somente retire da tomada.* \nAguarde 1 minuto e ligue novamente!'
    )
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Veja se seu acesso voltou! Caso não tenha voltado, retorne o contato e fale com um atendente!'
    )

    // Atualiza o status do cliente no DB
    await updateTicketStatus(Number(uuid_cliente), 'Desbloqueado')
  } catch (error: any) {
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Opss! Algo de errado aconteceu! Digite *#* para voltar ao menu anterior e fale com um atendente!'
    )
  }
}

const processSegundaVia = async (
  ticket: Ticket,
  msg: any,
  contact: Contact,
  wbot: WASocket
) => {
  const companyId = ticket.companyId

  if (ticket.queueId == null) {
    console.error('Id da fila é nulo ou indefinido')
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Erro interno: Identificador da fila não encontrado'
    )
    return
  }

  const filaEscolhida = ticket.queueId.toString()

  if (
    filaEscolhida === '2ª Via de Boleto' ||
    filaEscolhida === '2 Via de Boleto'
  ) {
    const cpfCnpj = getAndCleanCpfCnpj(msg)

    if (cpfCnpj) {
      try {
        const config = await initializeProviderConfig(companyId)
        if (!config) {
          console.error(
            'Configuração não encontrada para companyId:',
            companyId
          )
          return
        }

        const { url, clientId, clientSecret, ixckeyBase64, urlIxc, asaasToken } = config
        const isCPFCNPJValid = validaCpfCnpj(cpfCnpj)

        if (isCPFCNPJValid) {
          await sendWhatsAppMessage(
            wbot,
            contact,
            ticket,
            'Aguarde! Estamos consultando na base de dados!'
          )

          // Adiciona integração com o Asaas
          await clienteAsaas(wbot, contact, ticket, asaasToken, cpfCnpj)

          // Autenticação com MKAuth
          const jwt = await authenticateMKAuth(url, clientId, clientSecret)

          // Buscar cliente no MKAuth
          const clientDataMKAuth = await fetchClientData(url, cpfCnpj, jwt)
          if (clientDataMKAuth !== 'NULL') {
            await processBoletos(clientDataMKAuth, contact, ticket, wbot, url, jwt)
            const bloqueado = clientDataMKAuth.dados_cliente.bloqueado

            if (bloqueado === 'sim') {
              await desbloquearConexao(wbot, contact, ticket, jwt, clientDataMKAuth.dados_cliente.uuid_cliente, url)
            }
          } else {
            await sendWhatsAppMessage(
              wbot,
              contact,
              ticket,
              'Não encontrei registros no sistema. Por favor, verifique as informações fornecidas.'
            )
          }
        } else {
          await sendWhatsAppMessage(
            wbot,
            contact,
            ticket,
            'O CPF/CNPJ fornecido é inválido. Por favor, envie um CPF ou CNPJ válido.'
          )
        }
      } catch (error: any) {
        console.error('Erro ao processar a segunda via do boleto:', error)
        await sendWhatsAppMessage(
          wbot,
          contact,
          ticket,
          'Ocorreu um erro interno ao processar sua solicitação. Por favor, tente novamente mais tarde.'
        )
      }
    } else {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'CPF ou CNPJ não encontrado na mensagem. Por favor, envie um CPF ou CNPJ válido.'
      )
    }
  } else {
    console.error('Fila não é para segunda via de boleto')
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Essa fila não é para solicitações de segunda via de boleto.'
    )
  }
}

export default processSegundaVia