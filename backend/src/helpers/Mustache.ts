import Mustache from 'mustache'
import prisma from '../prisma/client'
import { Contact } from '@prisma/client'

interface View {
  name: string
  greeting: string
  ms: string
  protocol: string
  hora: string
  savedContact?: object
}

export const greeting = (): string => {
  const greetings = ['Boa madrugada', 'Bom dia', 'Boa tarde', 'Boa noite']
  const h = new Date().getHours()
  // eslint-disable-next-line no-bitwise
  return greetings[(h / 6) >> 0]
}

export const firstName = (contact?: Contact): string => {
  if (contact && contact?.name) {
    const nameArr = contact?.name.split(' ')
    return nameArr[0]
  }
  return ''
}

export default ( body: string, contact: Contact ): string => {
  let ms = ''

  const Hr = new Date()

  const dd: string = `0${Hr.getDate()}`.slice(-2)
  const mm: string = `0${Hr.getMonth() + 1}`.slice(-2)
  const yy: string = Hr.getFullYear().toString()
  const hh: number = Hr.getHours()
  const min: string = `0${Hr.getMinutes()}`.slice(-2)
  const ss: string = `0${Hr.getSeconds()}`.slice(-2)

  if (hh >= 6) {
    ms = 'Bom dia'
  }
  if (hh > 11) {
    ms = 'Boa tarde'
  }
  if (hh > 17) {
    ms = 'Boa noite'
  }
  if (hh > 23 || hh < 6) {
    ms = 'Boa madrugada'
  }

  const randomId = Math.random().toString(36).substring(2, 6)
  const protocol = `${randomId}${yy}${mm}${dd}${String(hh)}${min}${ss}`

  const hora = `${hh}:${min}:${ss}`

  const view = {
    firstName: firstName(contact),
    name: contact ? contact.name : "",
    greeting: greeting(),
    ms,
    protocol,
    hora,
  }

  // Retornando a mensagem renderizada
  return Mustache.render(body, view)
}