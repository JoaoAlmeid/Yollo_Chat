import { sleep } from './sleep'
import { WASocket } from '@whiskeysockets/baileys'
import { Contact, Ticket } from '@prisma/client'
import formatBody from '../../../../helpers/Mustache'

export const sendWhatsAppMessage = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  text: string
) => {
  const body = {
    text: await formatBody(text, contact),
  }

  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )

  await sleep(2000)
}

export const sendWAPPNullMessage = async (
  wbot: WASocket,
  contact: Contact,
  text: string,
  ticket?: Ticket
) => {
  const body = {
    text: await formatBody(text, contact),
  }

  // Verifica se o ticket é fornecido
  const recipient = ticket
    ? `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`
    : `${contact.number}@s.whatsapp.net`

  await wbot.sendMessage(recipient, body)
  await sleep(2000)
}

export const sendMessageWithImage = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  imageUrl: string,
  caption: string
) => {
  // Implementação para enviar uma imagem com uma legenda
}

export const sendErrorMessage = async (
  wbot: WASocket,
  contact: Contact,
  ticket: Ticket,
  text: string
) => {
  const body = {
    text: await formatBody(text, contact),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )
}

export const sendNotFoundMessage = async (
  contact: Contact,
  ticket: Ticket,
  wbot: WASocket,
  text: string
) => {
  const body = {
    text: await formatBody(text, contact),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )
}
export const sendMessage = async (
  contact: Contact,
  ticket: Ticket,
  wbot: WASocket,
  text: string
) => {
  const body = {
    text: await formatBody(text, contact),
  }
  await sleep(2000)
  await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`,
    body
  )
}
