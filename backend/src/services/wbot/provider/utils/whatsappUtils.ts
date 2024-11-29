import { sendWhatsAppMessage, sendMessageWithImage } from './sendMessage'
import { sleep } from './sleep'
import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'

export const notifyProcessing = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket
) => {
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Aguarde! Estamos consultando na base de dados!`
  )
  await sleep(2000)
}

export const notifyCustomerNotFound = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket
) => {
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Cadastro não localizado! *CPF/CNPJ* incorreto ou inválido. Tente novamente!`
  )
}

export const notifyNoOverduePayments = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket
) => {
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Você não tem nenhuma fatura vencida! \nVou te enviar a próxima fatura. Por favor aguarde!`
  )
}

export const notifyInvoice = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  payment: any,
  nome: string
) => {
  const value_pending_corrigida = payment.value.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  })
  const dueDate_pending_corrigida = payment.dueDate
    .split('-')
    .reverse()
    .join('/')

  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Segue a segunda-via da sua Fatura!\n\n*Fatura:* ${payment.invoiceNumber}\n*Nome:* ${nome}\n*Valor:* ${value_pending_corrigida}\n*Data Vencimento:* ${dueDate_pending_corrigida}\n*Descrição:*\n${payment.description}\n*Link:* ${payment.invoiceUrl}`
  )
  await sleep(2000)
}

export const notifyPixAndBarcode = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  pixData: any,
  barcodeData: any
) => {
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Este é o *PIX Copia e Cola*`
  )
  await sleep(2000)
  await sendWhatsAppMessage(wbot, contact, ticket, pixData.payload)
  await sleep(2000)
  const linkBoleto = `https://chart.googleapis.com/chart?cht=qr&chs=500x500&chld=L|0&chl=${pixData.payload}`
  await sendMessageWithImage(wbot, contact, ticket, linkBoleto, '')
  await sleep(2000)
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    `Este é o *Código de Barras*!`
  )
  await sleep(2000)
  await sendWhatsAppMessage(
    wbot,
    contact,
    ticket,
    barcodeData.identificationField
  )
}
