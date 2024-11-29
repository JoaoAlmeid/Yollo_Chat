import moment from "moment"
import { getIO } from "../../libs/socket"
import prisma from "../../prisma/client"
import SendWhatsAppMessage from "./SendWhatsAppMessage"
import formatBody from '../../helpers/Mustache'
import verifyMessage from "./messageListener/verify/verifyMessage"
import ShowTicket from "../tickets/ShowTicket"
import AppError from "../../errors/AppError"

export const ClosedAllOpenTickets = async (companyId: number): Promise<void> => {
    const closeTicket = async (ticket: any, currentStatus: any, body: any) => {
        if (currentStatus === 'nps' && currentStatus === "open") {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: "closed",
                    lastMessage: body,
                    unreadMessages: 0,
                    amountUsedBotQueues: 0
                }
            })
        } else {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: "closed",
                    unreadMessages: 0,
                }
            })
        }
    }

    const io = getIO()
    try {
        // Busca todos os tickets abertos para a empresa especificada
        const tickets = await prisma.ticket.findMany({
            where: { 
                status: 'open',
                companyId
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        for (const ticket of tickets) {
            const showTicket = await ShowTicket(ticket.id, companyId)
            const whatsapp = await prisma.whatsapp.findUnique({
                where: { id: showTicket?.whatsappId }
            })
            if (!showTicket) return

            const ticketTraking = await prisma.ticketTracking.findFirst({
                where: {
                    ticketId: ticket.id,
                    finishedAt: null
                }
            })
            if (!ticketTraking) return

            const { expiresInactiveMessage, expiresTicket } = whatsapp

            // @ts-ignore: Unreachable code error
            if (expiresTicket && expiresTicket !== "" && Number(expiresTicket) > 0) {
                const contact = await prisma.contact.findUnique({
                    where: { id: showTicket.contactId }
                })

                if (contact) {
                    const bodyExperesMessageInactive = formatBody(`\u200e ${expiresInactiveMessage}`, contact)
                    const dataLimite = new Date()
                    dataLimite.setMinutes(dataLimite.getMinutes() - Number(expiresTicket))
    
                    if (showTicket.status === 'open' && !showTicket.isGroup) {
                        const dataUltimaInteracaoChamado = new Date(showTicket.updatedAt)
    
                        if (dataUltimaInteracaoChamado < dataLimite && showTicket.fromMe) {
                            await closeTicket(showTicket, showTicket.status, bodyExperesMessageInactive)
    
                            if (expiresInactiveMessage) {
                                const sentMessage = await SendWhatsAppMessage({ body: bodyExperesMessageInactive, ticket: showTicket })
                                await verifyMessage(sentMessage, showTicket, contact)
                            }
    
                            await prisma.ticketTracking.update({
                                where: { id: ticketTraking.id },
                                data: {
                                    finishedAt: moment().toDate(),
                                    closedAt: moment().toDate(),
                                    whatsappId: ticket.whatsappId,
                                    userId: ticket.userId
                                }
                            })
    
                            io.to("open").emit(`company-${companyId}-tikcet`, {
                                action: "delete",
                                ticketId: showTicket.id
                            })
                        }
                    }
                } else {
                    throw new AppError('Contato não encontrado', 404)
                }
            }
        } 
    } catch (error: any) {
        console.log('Erro ao fechar tickets', error)
    }
}