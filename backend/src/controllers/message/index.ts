import { Request, Response } from 'express'
import ListMessages from '../../services/message/List'
import prisma from '../../prisma/client';
import formatBody from 'src/helpers/Mustache'

import SetTicketMessagesAsRead from 'src/helpers/SetTicketMessagesAsRead';
import ShowTicket from 'src/services/tickets/ShowTicket';
import SendWhatsAppMessage from 'src/services/wbot/SendWhatsAppMessage';
import SendWhatsAppMedia from 'src/services/wbot/SendWhatsAppMedia';
import AppError from 'src/errors/AppError';
import CheckContactNumber from 'src/services/wbot/CheckNumber';
import GetProfilePicUrl from 'src/services/wbot/GetProfilePicUrl';
import CreateOrUpdateContactService from 'src/services/contact/CreateOrUpdate';
import FindOrCreateTicket from 'src/services/tickets/FindOrCreateTicket';
import UpdateTicket from 'src/services/tickets/UpdateTicket';
import DeleteWhatsAppMessage from 'src/services/wbot/DeleteWhatsAppMessage';
import { getIO } from 'src/libs/socket';
import { IndexQuery, MessageData } from './types';



class MessageController {
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params
      const { pageNumber } = req.query as IndexQuery
      const { companyId, profile } = req.user
      const queues: number[] = []

      if (profile !== "admin") {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { queues: true }
        });
        user.queues.forEach(queue => {
          queues.push(queue.id);
        });
      }

      const { count, messages, ticket, hasMore } = await ListMessages({
        pageNumber,
        ticketId,
        companyId,
        queues
      })

      SetTicketMessagesAsRead(ticket)

      res.status(200).json({ count, messages, ticket, hasMore })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar mensagens" })
      throw new AppError(`Ocorreu um erro ao recuperar mensagens: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    const { ticketId } = req.params
    const { body, quotedMsg }: MessageData = req.body
    const medias = req.files as Express.Multer.File[]
    const { companyId } = req.user

    try {
      const ticket = await ShowTicket(ticketId, companyId)
      
      SetTicketMessagesAsRead(ticket)

      if (medias && medias.length > 0) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File, index) => {
            await SendWhatsAppMedia({ 
              media, 
              ticket, 
              body: Array.isArray(body) ? body[index] : body 
            })
          })
        )
      } else {
        const contact = await prisma.contact.findUnique({ where: { id: ticket.contactId } })
        if (!contact) {
          throw new AppError('Contato não encontrado', 404)
        }
        const formattedBody = formatBody(body, contact)
        await SendWhatsAppMessage({ body: formattedBody, ticket, quotedMsg })

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { lastMessage: formattedBody }
        })
      }
  
      return res.status(200).send({ mensagem: "Mensagem Enviada" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar mensagem" })
      throw new AppError(`Ocorreu um erro ao criar mensagem: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { messageId } = req.params
    const { companyId } = req.user

    try {
      const message = await DeleteWhatsAppMessage(messageId)
      const io = getIO()
      io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
        action: "update",
        message
      })
  
      return res.status(200).send({ mensagem: "Mensagem Excluida" })
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar mensagem" })
      throw new AppError(`Ocorreu um erro ao deletar mensagem: ${error.message}`, 500)
    }
  }

  public async send(req: Request, res: Response): Promise<Response> {
    const { whatsappId } = req.params
    const messageData: MessageData = req.body
    const medias = req.files as Express.Multer.File[]

    try {
      const whatsapp = await prisma.whatsapp.findUnique({
        where: { id: Number(whatsappId) }
      })

      if (!whatsapp) {
        throw new AppError('Não foi possivel realizar a operação')
      }

      if (messageData.number === undefined) {
        throw new AppError('O número é obrogatório')
      }

      const numberToTest = messageData.number
      const body = messageData.body

      const companyId = whatsapp.companyId

      const CheckValidNumber = await CheckContactNumber(numberToTest, companyId)
      const number = CheckValidNumber.jid.replace(/\D/g, "")
      const profilePicUrl = await GetProfilePicUrl(number, companyId)

      const contactData = {
        name: `${number}`,
        number,
        profilePicUrl,
        isGroup: false,
        companyId
      }

      const contact = await CreateOrUpdateContactService(contactData)

      const ticket = await FindOrCreateTicket(contact.id, whatsapp.id!, 0, companyId)

      if (medias && medias.length > 0) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            await req.app.get("queues").messageQueue.add(
              "SendMessage",
              {
                whatsappId,
                data: {
                  number,
                  body: body ? formatBody(body, contact) : media.originalname,
                  mediaPath: media.path,
                  fileName: media.originalname
                }
              },
              { removeOnComplete: true, attempts: 3 }
            );
          })
        );
      } else {
        const formattedBody = formatBody(body, contact)
        await SendWhatsAppMessage({ body: formatBody(body, contact), ticket });
  
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            lastMessage: formattedBody,
          }
        });
      }
  
      if (messageData.closeTicket) {
        setTimeout(async () => {
          await UpdateTicket({
            ticketId: ticket.id,
            ticketData: { status: "closed" },
            companyId
          });
        }, 1000);
      }
      
      SetTicketMessagesAsRead(ticket);
  
      return res.send({ mensagem: "Mensagem enviada" });
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao enviar mensagem" })
      throw new AppError(`Ocorreu um erro ao enviar mensagem: ${error.message}`, 500)
    }
  }
}

export default new MessageController()