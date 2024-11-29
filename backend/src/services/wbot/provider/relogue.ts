import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import axios from 'axios'
import { initializeProviderConfig } from './utils/initializeProviderConfig'
import { validaCpfCnpj } from '../messageListener/validate/ValidarCpfCnpj'
import { getAndCleanCpfCnpj } from './utils/getAndCleanCpfCnpj'
import { authenticateMKAuth } from './utils/authenticateMKAuth'
import { sendWhatsAppMessage } from './utils/sendMessage'
import { fetchClientData } from './utils/fetchClientData'

const processRelogue = async (
  ticket: Ticket,
  msg: any,
  contact: Contact,
  wbot: WASocket
) => {
  const companyId = ticket.companyId

  // Garantir que o Id da fila não seja null
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

  if (ticket.queueId.toString() !== 'Liberação de Acesso') {
    return
  }

  const cpfCnpj = getAndCleanCpfCnpj(msg)

  if (!cpfCnpj) {
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'CPF/CNPJ não encontrado. Tente novamente com um CPF/CNPJ válido.'
    )
    return
  }

  try {
    const config = await initializeProviderConfig(companyId)

    if (!config) {
      console.error('Configuração não encontrada para companyId:', companyId)
      return
    }

    const { url, clientId, clientSecret } = config
    const isCPFCNPJValid = validaCpfCnpj(cpfCnpj)

    if (!isCPFCNPJValid) {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'CPF/CNPJ inválido. Tente novamente.'
      )
      return
    }

    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Aguarde! Estamos consultando na base de dados!'
    )

    // Autenticação com MKAuth
    const jwt = await authenticateMKAuth(url, clientId, clientSecret)
    const clientDataMKAuth = await fetchClientData(url, cpfCnpj, jwt)

    if (clientDataMKAuth === 'NULL') {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'Cadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tente novamente!'
      )
      return
    }

    const { nome, uuid_cliente, bloqueado } = clientDataMKAuth.dados_cliente

    // Mensagem de localização de cadastro
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      `Localizei seu Cadastro! *${contact.name}* só mais um instante por favor!`
    )

    if (bloqueado === 'sim') {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        `${nome}, vi que sua conexão está bloqueada! Vou desbloquear para você por *48 horas*.\n\n*OBS: Somente retire da tomada.* \nAguarde 1 minuto e ligue novamente!`
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
          'Pronto liberei! Veja se seu acesso voltou. Caso não tenha voltado, retorne o contato e fale com um atendente!'
        )
      } catch (error: any) {
        await sendWhatsAppMessage(
          wbot,
          contact,
          ticket,
          'Opss! Algo de errado aconteceu! Digite *#* para voltar ao menu anterior e fale com um atendente!'
        )
      }
    } else {
      await sendWhatsAppMessage(
        wbot,
        contact,
        ticket,
        'Seu acesso já está liberado. Caso precise de mais assistência, por favor entre em contato.'
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar ticket:', error)
    await sendWhatsAppMessage(
      wbot,
      contact,
      ticket,
      'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
    )
  }
}

export { processRelogue }
