import { WAMessage, AnyMessageContent } from '@whiskeysockets/baileys'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { Ticket } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { exec } from 'child_process'
import mime from 'mime-types'
import path from 'path'
import fs from 'fs'

import GetTicketWbot from '../../helpers/GetTicketWbot'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import formatBody from '../../helpers/Mustache'

interface Request {
  media: Express.Multer.File
  ticket: Ticket
  body?: string
}

// Define o caminho para a pasta pública
const publicFolder = path.resolve(__dirname, '..', '..', '..', 'public')

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error)
        fs.unlinkSync(audio)
        resolve(outputAudio)
      }
    )
  })
}

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error)
        fs.unlinkSync(audio)
        resolve(outputAudio)
      }
    )
  })
}

// Função para gerar as opções de mensagem baseadas no tipo de mídia
export const getMessageOptions = async (fileName: string, pathMedia: string, body?: string): Promise<any> => {
  const mimeType = mime.lookup(pathMedia)
  if (!mimeType) { throw new Error('Mimetype inválido') }
  const typeMessage = mimeType.split('/')[0]
  
  try {
    let options: AnyMessageContent
    
    if (typeMessage === 'video') {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : '',
        fileName: fileName,
        // gifPlayback: true
      }
    } else if (typeMessage === 'audio') {
      const typeAudio = fileName.includes('audio-record-site')
      const convert = await processAudio(pathMedia)
      options = {
        audio: fs.readFileSync(convert),
        mimetype: typeAudio ? 'audio/mp4' : mimeType,
        caption: body ? body : null,
        ptt: true,
      }
    } else if (
      typeMessage === 'document' ||
      typeMessage === 'text' ||
      typeMessage === 'application'
    ) {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType,
      }
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null,
      }
    }

    return options
  } catch (e) {
    Sentry.captureException(e)
    console.error(e)
    return null
  }
}

// Função principal para enviar mídia pelo WhatsApp
const SendWhatsAppMedia = async ({ media, ticket, body }: Request): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket)
    const contact = await prisma.contact.findUnique({
      where: { id: ticket.contactId },
    })

    if (!contact) {
      throw new AppError(`Contato não encontrado`, 404)
    }

    const pathMedia = media.path
    const typeMessage = media.mimetype.split("/")[0]
    let options: AnyMessageContent;
    const bodyMessage = formatBody(body, contact)

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname,
        // gifPlayback: true
      }
    } else if (typeMessage === "audio") {
      const typeAudio = media.originalname.includes("audio-record-site")
      if (typeAudio) {
        const convert = await processAudio(media.path)
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : media.mimetype,
          ptt: true
        }
      } else {
        const convert = await processAudioFile(media.path)
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : media.mimetype
        }
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname,
        mimetype: media.mimetype
      }
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname,
        mimetype: media.mimetype
      }
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: bodyMessage,
      }
    }

    // Define o destinatário com base no número do contato e se é um grupo
    const recipient = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`
    const sentMessage = await wbot.sendMessage(recipient, {...options})

    if (!sentMessage) {
      throw new AppError('Erro ao enviar a mensagem', 400)
    }

    // Atualiza o último mensagem do ticket após o envio da mídia
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { lastMessage: bodyMessage },
    })

    return sentMessage
  } catch (err) {
    Sentry.captureException(err)
    console.error(err)
    throw new AppError('ERR_SENDING_WAPP_MSG')
  } finally {
    await prisma.$disconnect()
  }
}

export default SendWhatsAppMedia