import { BinaryNode, Contact as BContact } from "@whiskeysockets/baileys"
import * as Sentry from "@sentry/node"
import { logger } from "../../utils/Logger"
import createOrUpdateBaileysService from "../baileys/CreateOrUpdateBailey"
import CreateMessage from "../message/Create"
import { Session } from "../../@types/Session"
import { Whatsapp } from "@prisma/client"
import prisma from "../../prisma/client"
import moment from "moment"
import AppError from "../../errors/AppError"

const wbotMonitor = async (wbot: Session, whatsapp: Whatsapp, companyId: number): Promise<void> => {
    try {
      wbot.ws.on("CB:call", async (node: BinaryNode) => {
        const content = node.content[0] as any
        if (content.tag === "offer") {
          const { from, id } = node.attrs
        }
    
        if (content.tag === "terminate") {
          const sendMsgCall = await prisma.setting.findFirst({
            where: { 
                key: "call", 
                companyId 
            }
          })
    
          if (sendMsgCall.value === "disabled") {
            await wbot.sendMessage(node.attrs.from, {
              text:
                `*Mensagem Automática:*\n\n
                As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado`,
            })
    
            const number = node.attrs.from.replace(/\D/g, "")
            const contact = await prisma.contact.findFirst({
              where: { companyId, number },
            })

            if (!contact) { 
                throw new AppError('Contato não encontrado', 404) 
            }
    
            const ticket = await prisma.ticket.findFirst({
              where: {
                contactId: contact.id,
                whatsappId: wbot.id,
                companyId
              },
            })
            
            if (!ticket) {
                console.log("Ticket não encontrado")
                return
            }
    
            const formattedTime = moment().format("HH:mm")
            const body = `Chamada de voz/vídeo perdida às ${formattedTime}`

            const messageData = {
              id: content.attrs["call-id"],
              ticketId: ticket.id,
              contactId: contact.id,
              body,
              fromMe: false,
              mediaType: "call_log",
              read: true,
              quotedMsgId: null,
              ack: 1,
            }
    
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    lastMessage: body,
                }
            })
    
    
            if(ticket.status === "closed") {
              await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: "pending",
                }
              })
            }
    
            return CreateMessage({ messageData, companyId })
          }
        }
      })
    
      wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
        await createOrUpdateBaileysService({
          whatsappId: whatsapp.id,
          contacts,
        })
      })
    
    } catch (err) {
      Sentry.captureException(err)
      logger.error(err)
    }
}

export default wbotMonitor